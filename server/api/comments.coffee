perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = require "../error"
###
Add a comment to a mod
@param userid the current logged user
@param sug the mod slug
@param name the title of the comment
@param body the content of the comment
@permission comment:add
###
exports.add = ((userid, slug, name, body, callback) ->
  canThis(userid, "comment", "add").then (can)->
    if can is false then return callback error.throwError(err, "UNAUTHORIZED")
    # Validate options
    Mod = mongoose.model "Mod"

    Mod.findOne slug: slug, (err, mod) ->
      return callback error.throwError(err, "DATABASE_ERROR") if err
      mod.comments.push
        title: validator.escape(name)
        body: validator.escape(body)
        date: Date.now()
        author: userid
      mod.save (err, mod) ->
        errors.handleResult err, mod, callback

    return
).toPromise @
