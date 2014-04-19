perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"

###
Lists the mods and pass them to the then with a `totalCount` property that counts the mods
@param userid the current logged user
@param options the options
@permission mod:browse
###
exports.list = ((userid, options, callback) ->
  canThis(userid, "mod", "browse").then (can)->
    if can is false then return callback(new Error "unauthorized")
    # Validate options
    if options.perPage > 50
      return callback(new Error "invalid_args")
    Mod = mongoose.model "Mod"
    Mod.list options, (err, mods) ->
      return callback err if err
      Mod.count().exec (err, count) ->
        mods.totalCount = count
        return callback mods

    return
).toPromise @


###
Return a mod
@param userid the current logged user id or ""
@param slug the slug of the mod
@param cart the current cart id or null
@param user the current user for edition ({})
@permission mod:browse
###
exports.view = ((userid, slug, cart, user, callback) ->
  canThis(userid, "mod", "browse").then (can)->
    if can is false then return callback(new Error "unauthorized")
    # Validate options

    Mod = mongoose.model "Mod"
    Mod.load
      slug: slug
      $cart_id: cart
      $user: user
    , (err, mod) ->
      if err or not mod
        return callback(new Error "not_found")
      mod.htmlbody = require("../parser")(mod.body)
      callback mod

    return

    return
).toPromise @


###
Return a mod fully loaded with deps and versions
@param userid the current logged user id or ""
@param slug the slug of the mod
@permission mod:browse
###

exports.load = ((userid, slug, callback) ->
  canThis(userid, "mod", "browse").then (can)->
    if can is false then return callback(new Error "unauthorized")
    # Validate options

    Mod = mongoose.model "Mod"
    Mod.load
      slug: slug
      author: userid
    , (err, mod) ->
      return callback(new Error "unauthorized")  if err or not mod
      mod.fillDeps (err, deps)->
        return callback(new Error "database_error")  if err or not deps
        mod.listVersion (v) ->
          container =
            mod: mod
            deps: deps
            versions: v
          callback container
).toPromise @

