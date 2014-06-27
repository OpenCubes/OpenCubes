perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"
async = require "async"
uuid = require "node-uuid"
Q = require "q"
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
    Feed = mongoose.model "Feed"
    User.findOne({username: name}).exec (err, user) ->
      return callback err if err
      return callback errors.throwError("Not found", "NOT_FOUND") if not user
      data = user.toObject()
      data.meta = {}
      Mod = mongoose.model("Mod")
      async.parallel [
        (callback) ->
          Mod.find({author: user._id}).select("name vote_count created logo slug").sort("-vote_count").limit(5).exec (err, mods) ->
            data.popularMods = mods
            callback err
        (callback) ->
          Mod.find({author: user._id}).select("name vote_count created logo slug").sort("-created").limit(5).exec (err, mods) ->
            data.lastestMods = mods
            callback err
        (callback) ->
          Feed.find({author: user._id}).sort("-date").limit(10).exec (err, feed) ->
            data.feed = feed
            callback err
        (callback) ->
          Mod.count {"stargazers.id": user._id}, (err, count) ->
            data.meta.starred = count
            callback err
        (callback) ->
          Mod.count {"author": user._id}, (err, count) ->
            data.meta.mods = count
            callback err

      ], (err) ->
        callback err or data

    return
).toPromise @


exports.itemize = ($criterias, options) ->
  regexpCriterias = /username|location|public_email/
  criterias = {}
  deferred = Q.defer()
  result = {}

  for own key, value of $criterias
    if key.match regexpCriterias
      if value.match /\*((\w|_|-\s)+)/g
        criterias[key] = new RegExp(/\*((\w|_|-\s)+)/g.exec(value)[1],"gi")
      else
        criterias[key] = value.replace((/[^a-zA-Z\s-_]/g), "")

  # Validate options
  if options.limit > 100
    deferred.reject(error.throwError("Too much users per page", "INVALID_PARAMS"))

  # start finding
  User = mongoose.model "User"
  User.find(criterias)
  # limit
  .limit(options.limit or 25)
  # skip items
  .skip(options.skip or 0)
  # sort order
  .sort(options.sort or "-created")
  # select and lean
  .select("username location bio").lean()
  .exec().then((users) ->
    result.users = users
    # count the users
    return User.count(criterias).exec()
  , deferred.reject).then((count) ->
    result.totalCount = count
    result.status = "success"
    criterias[k] = criterias[k].toString() for k of criterias
    result.query =
      criterias: criterias
      options: options
    for user of result.users
      result.users[user].links =
        http: "/api/v1/users/#{result.users[user].username}"
        html: "/users/#{result.users[user].username}"
      #  logo: "/assets/#{result.users[user].slug}.png"
    deferred.resolve result
  , deferred.reject)

  return deferred.promise


validators =
  website: /((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g
  bio: /(.){15,100}/g
  avatar: /(.)+/g
  location: /(.)+/g
  company: /(.)+/g
  public_email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g

escapeHtml = (str) ->
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace />/g, "&gt;"
exports.doEdit = ((userid, name, data) ->
  # Q promise
  deferred = Q.defer()
  console.log "data", data
  # Q promise
  deferred = Q.defer()
  # default value
  can = false
  # We check wheteher it can or not
  canThis(userid, "user", "edit").then((can)->
    if not userid
      return deferred.reject(error.throwError "", "UNAUTHORIZED")
    User = mongoose.model "User"
    User.findOne({username: name}).select("username location website public_email company bio").exec()
  ).then((user) ->
    # Can the current user do that?
    if not user._id.equals(userid) and can is false
      return deferred.reject(error.throwError "", "UNAUTHORIZED")
    # Update if validated
    user.website        = data.website       if validators.website.test       data.website
    user.bio            = data.bio           if validators.bio.test           data.bio
    user.public_email   = data.public_email  if validators.public_email.test  data.public_email
    user.company        = data.company       if validators.company.test       data.company
    user.location       = data.location      if validators.website.test       data.location
    user.save (err, user) ->
      if err
        return deferred.reject err
      deferred.resolve user
  ).fail((err) ->
    deferred.reject err
  )
  deferred.promise


)
exports.edit = (userid, name) ->
  # Q promise
  deferred = Q.defer()
  # default value
  can = false
  # We check wheteher it can or not
  canThis(userid, "user", "edit").then((can)->
    if not userid
      return deferred.reject(error.throwError "", "UNAUTHORIZED")
    User = mongoose.model "User"
    User.findOne({username: name}).select("username location website public_email company bio").exec()
  ).then((user) ->
    # Can the current user do that?
    if not user._id.equals(userid) and can is false
      return deferred.reject(error.throwError "", "UNAUTHORIZED")
    # Done!
    deferred.resolve user
  ).fail((err) ->
    deferred.reject err
  )
  deferred.promise



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
    if not user or err
      return;

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


    [1]: http://#{config.host}/recover/#{uid}
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
