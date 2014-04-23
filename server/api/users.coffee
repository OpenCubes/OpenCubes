perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"

###
Returns an user
@param userid the current logged user
@param name the name of the user
@permission user:browse
###
exports.view = ((userid, name, callback) ->
  canThis(userid, "user", "browse").then (can)->
    if can is false then return callback(new Error "unauthorized")
    # Validate options
    User = mongoose.model "User"
    User.findOne({username: name}).exec (err, user) ->
      callback err or user

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
    if can is false then return callback(new Error "unauthorized")
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



