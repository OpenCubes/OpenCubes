perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"
_  = require("lodash")
parse = require "../parser"
Q = require "q"
async = require "async"
Mod = mongoose.model "Mod"
Star = mongoose.model "Star"
User = mongoose.model "User"


###
Return the latest mods
@params limit the max amount of mods
###
exports.getLatestMods = (limit=6) ->
  deferred = Q.defer()
  Mod.find()
  .select("name vote_count author summary created logo slug")
  .sort("-created")
  .limit(limit)
  .exec (err, mods) ->
    if err then return deferred.reject err
    deferred.resolve mods
  deferred.promise

###
Returns the most popular mod ever
@params limit the aximum amiunt of mods
###
exports.getPopularMods = (limit=6) ->
  deferred = Q.defer()
  Mod.find()
  .select("name vote_count author created logo slug")
  .sort("-vote_count")
  .limit(limit)
  .exec (err, mods) ->
    if err then return deferred.reject err
    deferred.resolve mods
  deferred.promise

###
Get the trending mods for a period defined by a duration and a date,
that is to say the mods that got the most stars in this period
@params duration the duration of said period
(hour, day, week, month, quarter, year)
@params limit the max amount of mods
@params marker the marker date.
i. e.: the point of reference for the period
e. g.: if duration = "day" and marker=July, 4th 2006
       then it returns the trending mods on July, 4th 2006
###
exports.getTrendingMods = (duration="month", limit=6, marker=Date.now()) ->
  deferred = Q.defer()

  # We convert the date marker
  marker = new Date marker

  # We create a time bucket and get the element
  bucket = new TimeBucket(marker)
  element = bucket[duration] or bucket["month"]

  # Then we add it:
  match = {}
  match["time_bucket.#{duration}"] =  element

  # Aggregation start!
  Star.aggregate [
    {
      $match: match
    }
    {
      $group:
        _id: "$mod"
        stars:
          "$sum": 1
    }
    {
      $limit : limit
    }
    {
      $sort : {
        "stars": -1
        }
    }

  ], (err, docs) ->
    if err then return deferred.reject err

    # Then we populate the mods so we get the names and everything
    Star.populate docs,
      path: "_id",
      model: "Mod",
      select: "slug name summary author created lastUpdated"
    , (err, docs) ->
      if err then return deferred.reject err
      trendingMods = []

      # Process results
      for doc in docs
        doc._id.vote_count = doc.stars
        trendingMods.push doc._id

      # And we populate the author field
      User.populate trendingMods,
        path: "author"
        select: "username"
      , (err, docs) ->
        if err then return deferred.reject err

        # Resolve
        deferred.resolve docs
  deferred.promise

###
Lists the mods
@param criterias the criterias
@param options the options
@permission mod:browse
###
exports.itemize = ($criterias, options) ->
  regexpCriterias = /name|description|summary|category|slug|author/
  criterias = {}
  deferred = Q.defer()
  result = {}

  for own key, value of $criterias
    if key.match regexpCriterias
      if value.match /\*((\w|\d|_|-\s)+)/g
        criterias[key] = new RegExp(/\*((\w|_|\d|-\s)+)/g.exec(value)[1],"gi")
      else
        criterias[key] = value.replace((/[^a-zA-Z\s\d-_]/g), "")

  # Validate options
  if options.limit > 100
    deferred.reject(error.throwError("Too much mods per page", "INVALID_PARAMS"))

  # start finding
  Mod = mongoose.model "Mod"
  Mod.find(criterias)
  # limit
  .limit(options.limit or 25)
  # skip items
  .skip(options.skip or 0)
  # sort order
  .sort(options.sort or "-created")
  # select and lean
  .select("-body -logo -stargazers -comments").lean()
  .exec().then((mods) ->
    result.mods = mods
    # count the mods
    return Mod.count(criterias).exec()
  , deferred.reject).then((count) ->
    result.totalCount = count
    result.status = "success"
    criterias[k] = criterias[k].toString() for k of criterias
    result.query =
      criterias: criterias
      options: options
    for mod of result.mods
      result.mods[mod].links =
        http: "/api/v1/mods/#{result.mods[mod].slug}"
        html: "/mods/#{result.mods[mod].slug}"
        logo: "/assets/#{result.mods[mod].slug}.png"
    deferred.resolve result
  , deferred.reject)

  return deferred.promise


###
Lists the mods and pass them to the then with a `totalCount` property that counts the mods
@param userid the current logged user
@param options the options
@permission mod:browse
###
exports.list = (userid, options, callback) ->
  deferred = Q.defer()
  # Validate options
  if options.perPage > 50
    deferred.reject(error.throwError("Too much mods per page", "INVALID_PARAMS"))
  Mod = mongoose.model "Mod"
  Mod.list options, (err, mods) ->
    return deferred.reject error.throwError(err, "DATABASE_ERROR") if err
    Mod.count().exec (err, count) ->
      mods.totalCount = count
      if err
        deferred.reject err
      deferred.resolve mods

  deferred.promise

###
Return a mod description, title and quick informations
@param userid the current logged user id or ""
@param slug the slug of the mod
@param options additional options :
{
  cart: cart, // cart._id or null
  loggedUser: user,  // user for edtion
  doParse: true // should we parse the mod
}
@permission mod:browse
###
exports.lookup = (userid, slug, options) ->
  deferred = Q.defer()
  if not options
    callback = options
    options = {}
  options = _.assign options,{cart: undefined, loggedUser: undefined, doParse: true}
  cartId = options.cart
  canThis(userid, "mod", "browse").then (can)->
    try
      if can is false
        cb(error.throwError("Forbidden", "UNAUTHORIZED"))
      # Validate options
      Mod = mongoose.model "Mod"
      query = Mod.findOne({slug: slug})
      query.select("name slug body description summary comments logo created updatedAt author category")
      query.populate("author", "name")
      query.populate("comments.author", "username")
      query.lean()
      query.exec((err, mod) ->
        if cartId and mod
          return Cart.findById(cartId, (err, cart)->
            if !err and cart
              mod.fillCart cart
            if user
              mod.fillStargazer userid
            if err
              return deferred.reject err
            deferred.resolve mod
          )
        mod.htmlbody = parse mod.body
        if err
          return deferred.reject err
        deferred.resolve mod
      )
    catch err
      console.log err.stack.red
      return deferred.reject err


###
Return a mod description, title and quick informations
@param userid the current logged user id or ""
@param slug the slug of the mod
@param options additional options :
{
  cart: cart, // cart._id or null
  loggedUser: user,  // user for edtion
  doParse: true // should we parse the mod
}
@permission mod:browse
###
exports.getLogo = ((userid, slug, options, callback) ->
  Mod = mongoose.model "Mod"
  query = Mod.findOne({slug: slug})
  query.select("logo")
  query.lean()
  query.exec().then((mod) ->
    callback mod
  , (err)->
    callback err
  )
).toPromise @

uuid = require("node-uuid")
fs = require("fs")

exports.setLogo = (req, res) ->
  file = req.files.file
  if(!file)
    res.send 401, "missing file"
  uid = uuid.v4() + ".png"
  newfile = __dirname.getParent() + "/uploads/" + uid
  fs.rename file.path, newfile, (err) ->
    if err
      console.log err
      return res.send 500, "something went wrong while moving"
    app.api.mods.edit(req.getUserId(), req.params.id, "logo", uid).then((status) ->
      res.send 200, "Saved!"
    ).fail (err) ->
      errors.handleHttp err, req, res, "text"

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
      if can is false and mod.author isnt userid
        callback(error.throwError("Forbidden", "UNAUTHORIZED"))
      if err or not mod
        return handleResult(err, mod, callback)
      mod.fillDeps (err, deps)->
        if err or not deps
          handleResult
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

    Mod.findOne {slug: slug}, (err, mod) ->
      if can is false and mod.author isnt userid
        callback(error.throwError("Forbidden", "UNAUTHORIZED"))
      if err or not mod
        return handleResult(err, mod, callback)
      mod[field] = value
      mod.save (err, mod) ->
        errors.handleResult err, mod, callback


).toPromise @
###
Edit a mod
@param userid the current logged user id
@param slug the slug of the mod
@param body
@permission mod:edit
###

exports.put = (userid, slug, body) ->
  deferred = Q.defer()
  console.log body
  body = _.pick body, ['name', 'body', 'summary', 'category']
  canThis(userid, "mod", "browse").then (can)->
    # Validate options

    Mod = mongoose.model "Mod"

    Mod.findOne {slug: slug}, (err, mod) ->
      if can is false and mod.author isnt userid
        deferred.reject(error.throwError("Forbidden", "UNAUTHORIZED"))
      if err or not mod
        return handleResult(err, mod, deferred.reject)
      mod = _.assign mod, body
      mod.save (err, mod) ->
        if err
          return deferred.reject err

        deferred.resolve
          result: mod
          query:
            body: body


  return deferred.promise


###
Upload a mod
@param userid the current logged user id
@param mod the data of the new mod
@permission mod:add
###

exports.add = ((userid, mod, callback) ->
  canThis(userid, "mod", "add").then (can)->
    if can is false
      callback(error.throwError("Forbidden", "UNAUTHORIZED"))
    # Validate options

    Mod = mongoose.model "Mod"
    mod = new Mod mod
    mod.save((err, mod)->
      errors.handleResult err, mod, callback
    )

).toPromise @

###
Star a mod
@param userid the current logged user id
@param mod the data of the mod
@permission mod:star
###

exports.star = (userid, slug, date=Date.now(), dont_check=false) ->
  deferred = Q.defer()
  canThis(userid, "mod", "star").then (can)->
    if can is false
      deferred.reject(error.throwError("Forbidden", "UNAUTHORIZED"))
    # Validate options
    Mod = mongoose.model "Mod"
    mod = {}
    Star = mongoose.model "Star"
    q = Mod.findOne
      slug: slug
    q.select "slug name author vote_count logo"
    q.exec().then (doc) ->
      mod = doc
      Star.findOne
        user: userid
        mod: mod._id
      .exec()
    .then (star) ->
      if star and not dont_check
        mod.vote_count--
        mod.save()
        star.remove()
        deferred.resolve mod
        return
      star = new Star
        user: userid
        mod: mod._id
        date: date
      star.save(console.log)
      mod.vote_count = (mod.vote_count or 0) + 1
      mod.save(console.log)
      deferred.resolve mod
      return
    , deferred.reject
  deferred.promise

###
Search a mod
@param userid the current logged user id
@param query the query string
@permission mod:browse
###

exports.search = ((userid, query, callback) ->
  canThis(userid, "mod", "browse").then (can)->
    if can is false
      callback(error.throwError("Forbidden", "UNAUTHORIZED"))
    # Validate options
    Mod = mongoose.model "Mod"
    regex = new RegExp(query, 'i')
    q = Mod.find({name: regex})
    q.populate("author", "username")
    q.exec (err, mods) ->
      errors.handleResult err, mods, callback

).toPromise @

###
Add a file to a mod
@param userid the current logged user id
@param slug the slug of the mod
@param uid the uid (name) of the files loacted in uploads
@param path the target path
@param versionName the version of the mod
@permission mod:edit
###

exports.addFile = ((userid, slug, uid, path, versionName, callback) ->
  canThis(userid, "mod", "edit").then (can)->
    # Validate options
    Mod = mongoose.model "Mod"
    q = Mod.findOne
      slug: slug
    q.select("name slug author")
    q.exec (err, mod) ->
      if can is false and mod.author.equals(userid) isnt true
        callback(error.throwError("Forbidden", "UNAUTHORIZED"))
      if err or not mod
        callback err
      mod.addFile uid, path, versionName, (err, doc) ->
        errors.handleResult err, doc, callback

).toPromise @

###
Get the file of a mod
@param userid the current logged user id
@param slug the slug of the mod
@param uid the uid (name) of the files loacted in uploads
@param path the target path
@param versionName the version of the mod
@permission mod:edit
###

exports.getFiles = ((slug, version, callback) ->
  # Validate options
  Mod = mongoose.model "Mod"
  Version = mongoose.model "Version"

  query = Mod.findOne({slug: slug})
  query.select("name slug")
  query.exec().then((mod) ->
    console.log mod
    return Version.findOne({mod: mod._id, name: version}).exec()
  ).then((version) ->
    callback version.files
  , (err) ->
    errors.handleResult err, callback
  )
).toPromise @
###
Get the versions of the mod
@param slug the slug of the mod
@permission mod:edit
###

exports.getVersions = (slug) ->
  deferred = Q.defer()
  # Validate options
  Mod = mongoose.model "Mod"
  Version = mongoose.model "Version"

  query = Mod.findOne({slug: slug})
  query.select("name slug")
  query.exec().then((mod) ->
    return Version.find({mod: mod._id}).exec()
  ).then((versions) ->
    console.log versions
    data = []
    i = 0
    data[i++] = version.toObject() for version in versions when version isnt undefined
    deferred.resolve data
  )
  deferred.promise

###
Get the version of the mod
@param userid the current logged user id
@param slug the slug of the mod
@param name the version of the mod
@permission mod:edit
###

exports.getVersion = (slug, name) ->
  deferred = Q.defer()
  # Validate options
  Mod = mongoose.model "Mod"
  Version = mongoose.model "Version"

  query = Mod.findOne({slug: slug})
  query.select("name slug")
  query.exec().then((mod) ->
    return Version.findOne({mod: mod._id, name: name}).exec()
  ).then((versions) ->
    deferred.resolve versions
  )
  deferred.promise


###
Get the version of the mod
@param userid the current logged user id
@param slug the slug of the mod
@param name the version of the mod
@permission mod:edit
###

exports.addVersion = (slug, name) ->
  deferred = Q.defer()
  # Validate options
  Mod = mongoose.model "Mod"
  Version = mongoose.model "Version"
  modid = undefined
  query = Mod.findOne({slug: slug})
  query.select("name slug")
  query.exec().then((mod) ->
    modid = mod._id
    return Version.findOne({mod: mod._id, name: name}).exec()
  ).then((version) ->
    if version
      return deferred.resolve version
    version = new Version()
    version.name = name
    version.mod = modid
    version.save (err, v) ->
      if err then deferred.reject err
      deferred.resolve v
  )
  deferred.promise
