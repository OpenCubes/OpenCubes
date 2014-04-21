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
exports.view = ((userid, slug, cart, user, parse ,callback) ->
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
      if parse is true then mod.htmlbody = require("../parser")(mod.body)
      callback mod

    return

    return
).toPromise @


###
Return a mod fully loaded with deps and versions
@param userid the current logged user id or ""
@param slug the slug of the mod
@permission mod:edit
###

exports.load = ((userid, slug, callback) ->
  canThis(userid, "mod", "browse").then (can)->
    # Validate options

    Mod = mongoose.model "Mod"
    Mod.load
      slug: slug
    , (err, mod) ->
      if can is false and mod.author isnt userid then return callback(new Error "unauthorized")
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

###
Edit a mod
@param userid the current logged user id 
@param slug the slug of the mod
@param field the field to be edited
@param value the new value
@permission mod:edit
###

exports.edit = ((userid, slug, field, value, callback) ->
  canThis(userid, "mod", "browse").then (can)->
    # Validate options

    Mod = mongoose.model "Mod"
    
    Mod.findOne({slug: slug}, (err, mod) ->
      if can is false and mod.author isnt userid then return callback(new Error "unauthorized")
      if err or !mod
        if err then console.log err
        return callback(new Error "Please try again")
      mod[field] = value
      mod.save()
      return callback "ok"
    )
  
).toPromise @

###
Upload a mod
@param userid the current logged user id 
@param mod the data of the new mod
@permission mod:add
###

exports.add = ((userid, mod, callback) ->
  canThis(userid, "mod", "add").then (can)->
    if can is false then return callback(new Error "unauthorized")
    # Validate options

    Mod = mongoose.model "Mod"
    mod = new Mod mod
    mod.save((err, mod)->
      callback err or mod
    )
  
).toPromise @

###
Star a mod
@param userid the current logged user id
@param mod the data of the mod
@permission mod:star
###

exports.star = ((userid, slug, callback) ->
  canThis(userid, "mod", "star").then (can)->
    if can is false then return callback(new Error "unauthorized")
    # Validate options

    Mod = mongoose.model "Mod"
    q = Mod.findOne
      slug: slug
      "stargazers.id": userid
    ,
      "stargazers.$": 1
    q.exec (err, mod) ->
      return callback err  if err
      Mod.findOne
        slug: slug
      , (err, doc) ->
        return callback err  if err
        if !mod
          doc.stargazers.push
            id: userid
            date: Date.now()
          doc.vote_count = (doc.vote_count or 0) + 1
        else
          doc.vote_count--
          doc.stargazers.id(mod.stargazers[0]._id).remove()
        doc.save (err, mod) ->
          callback(err or mod)

).toPromise @



