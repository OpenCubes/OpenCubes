perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"
async = require "async"
uuid = require "node-uuid"
config = require "../config"
mail = require "./mail"

###
Returns an user
@param userid the current logged user
@param name the name of the user
@permission user:browse
###
exports.view = ((userid, name, callback) ->
  canThis(userid, "user", "browse").then (can)->
    if can is false then return callback (error.throwError "", "UNAUTHORIZED")
    # Validate options
    User = mongoose.model "User"
    User.findOne({username: name}).exec (err, user) ->
      return callback err if err
      return callback errors.throwError("Not found", "NOT_FOUND") if not user
      data = user.toObject()
      Mod = mongoose.model("Mod")
      async.parallel [
        (callback) ->
          Mod.find({author: user._id}).select("name vote_count created logo slug").sort("-vote_count").limit(10).exec (err, mods) ->
            data.popularMods = mods
            callback err
        (callback) ->
          Mod.find({author: user._id}).select("name vote_count created logo slug").sort("-created").limit(10).exec (err, mods) ->
            data.lastestMods = mods
            callback err
      ], (err) ->
        callback err or data

    return
).toPromise @

###
Creates an user
@param userid the current logged user
@param data the options of the user
@permission user:add
###
exports.registerLocal = ((userid, data, callback) ->
  canThis(userid, "user", "browse").then (can)->
    if can is false then return callback(error.throwError "", "UNAUTHORIZED")
    User = mongoose.model "User"
    user = new User(
      username: data.username
      email: data.email
      password: data.password
      provider: "local"
    )
    user.save (err, user) ->
      callback err or user

).toPromise @

requests = {}
exports.requestPasswordRecovery = (email) ->
  uid = uuid.v1()
  User = mongoose.model "User"

  User.findOne {email: email}, (err, user) ->

    # We register the uid
    requests[uid] = user._id

    # and we program autodestruction
    id = setTimeout(() ->
      delete requests[uid]
    , 1000*60*40)

    # The options
    mailOptions =
      from: "OpenCubes.org <no-reply@opencubes.org>",
      to: email,
      subject: "Account password recovery",

    # We create the message body in markdown
    body = """
    ## Resetting password
    Hi #{user.username},

    You have requested a **password recovery**. If you didn't, please ignore this email.

    To recover the password click on this link [on this link][1].

    Sincerly,

    The adminstrators


    [1]: https://#{config.host}/recover/#{uid}
    """

    # The result handler
    handler = (msg) ->
      console.log msg

    # Send it!
    mail(mailOptions, body).then(handler, handler).fail(() ->
      delete requests[uid]
    )

exports.recoverPassword = (uid, password, cb) ->
  User = mongoose.model "User"
  if not password and requests[uid]
    return true
  User.findOne {_id: requests[uid]}, (err, doc) ->
    return cb err if err
    doc.password = password
    doc.save()
