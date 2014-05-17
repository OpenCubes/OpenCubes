perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"
async = require "async"
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
