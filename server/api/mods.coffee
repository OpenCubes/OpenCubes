perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
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
