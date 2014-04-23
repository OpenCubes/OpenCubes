

perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"

###
Add a dependency to a version
@param userid the current logged user
@param sug the mod slug
@param name the title of the comment
@param body the content of the comment
@permission mod:edit
###
exports.add = ((userid, slug, dep, version, callback) ->
  canThis(userid, "mod", "edit").then (can)->
    # Validate options
    Mod = mongoose.model "Mod"
    Version = mongoose.model "Version"
    Mod.findOne {slug: slug}, (err, mod) ->
      if can is false and mod.author.equals(userid) isnt true then return callback(new Error "unauthorized")
      Mod.findOne {slug: dep}, (err, dep) ->
        if err or not dep then return callback err or new Error "not_found"
        Version.findOne {mod: dep._id, name: version}, (err, version)->
          version.slaves.push
            mod: mod._id
          version.save (err, version) ->
            console.log err or version
            return callback err or version

    return
).toPromise @
