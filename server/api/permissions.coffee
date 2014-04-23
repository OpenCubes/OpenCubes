User = require("mongoose").model("User")

###
This utility function determine whether an user can do this or this
using the permissions. e. g. "mod" "delete"

@param userId the id of the user
@param object the current object name ("mod", "user"...)
@param action to be executed on the object (delete, edit, browse...)
@param owner the optional owner id of the object to be "actionned"
###
exports.canThis = ((userId, object, action, ownerId, callback) ->
  if typeof ownerId is "function"
    callback = ownerId
    ownerId = undefined
  if userId is ""
    return process(undefined, object, action, ownerId, callback)
  User.findById(userId, (err, user) ->
    if err then return callback err
    process(user, object, action, ownerId, callback)
  )
).toPromise(@)

process = (user, object, action, ownerId, callback) ->
  if user then role = user.role or "user"
  group = config.user_groups[role or "guest"]
  if not group then return callback(new Error "No suitable group")

  # Parses the perms
  actions = group.allowedActions
  for objAction in actions when objAction.indexOf object is 0
    # We get all the allowed actions for the object and group
    act = objAction.split(":")[1]
    obj = objAction.split(":")[0]
    if act.split(" ").indexOf(action) isnt -1 and obj is object
      return callback true

  callback false

config = require "../config"
