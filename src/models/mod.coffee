mongoose = require("mongoose")
Schema = mongoose.Schema
Cart = mongoose.model("Cart")
slug = require("mongoose-slug")
timestamps = require("mongoose-times")
fs = require("fs")
_ = require "lodash"


ModSchema = mongoose.Schema(
  name:        String
  version:     String
  author:
    type: Schema.Types.ObjectId
    ref: "User"
  vote_count:  Number
  summary:     String
  body:        String
  logo:        String
  created:     Date
  lastUpdated: Date
  category:    String
  stars:       Number
  published:   Boolean
  images:     [String]
  cached:
    versions:  [String]
    followers: [String]
    versions_count:
      type:    Number
      default: 0
    rating:
      type:    Number
      default: 0
    rating_count:
      type:    Number
      default: 0
  comments: [
    author:
      type: Schema.Types.ObjectId
      ref: "User"
    title:     String
    body:      String
    date:      Date
  ]
)


ModSchema.pre 'save', true, (next, done) ->
  fields = ['name', 'summary', 'category', 'body', 'logo']
  paths = []
  if _.intersection(fields, @modifiedPaths()).length is 0 and not @isNew
    next()
    return done()
  if @isNew then @created = new Date()
  @lastUpdated = new Date()
  Feed = mongoose.model "Feed"
  type = if @isNew then "post" else "edition"
  feed = new Feed
    type: type
    date: Date.now()
    mod_name: @name
    author: @author._id or @author
    link: "/mods/#{@slug}"
  if not @isNew
    GlobalNotification = mongoose.model "GlobalNotification"
    GlobalNotification.notify
      author: @author._id or @author
      subject: @_id
      object_id: @_id
      verb: "edit"
  next()
  feed.save(done)

ModSchema.post 'remove',  (doc) ->

  console.log('`%s` has been removed', doc.name)

  # Remove the logo
  fs.unlink "../uploads/"+doc.logo, (err) ->
    if err then console.log err
    else console.log "File #{mod.logo} has been deleted"

  mongoose.model("Version").find {mod: doc._id}, (err, versions) ->
    version.remove() for version in versions when version

  mongoose.model("Stat").remove ref_id: doc._id

  mongoose.model("Rating").remove mod: doc._id

  mongoose.model("Subscription").update(
    { },
    { $pull: { subscriptions: { obj: doc._id} } },
    { multi: true }
  )
  Feed = mongoose.model("Feed")
  feed = new Feed
    type: "deletion"
    date: new Date()
    author: doc._id
    mod_name: doc.name
    link: ""
  feed.save()
  return

ModSchema.path("name").required true, "Mod title cannot be blank"
ModSchema.path("body").required true, "Mod body cannot be blank"
ModSchema.path("author").required true, "Mod author cannot be blank"
ModSchema.path("summary").required true, "Mod summary cannot be blank"
ModSchema.plugin slug("name")
ModSchema.path("name").validate (value) ->
  if not @isSelected "summary"
    return true
  if not value or value is ""
    return false
  if value.length < 5 or value.length > 40
    return false
  return true
, "Name should be between 5 and 40 characters long"
ModSchema.path("summary").validate (value) ->
  if not @isSelected "summary"
    return true
  if not value or value is ""
    return false
  if value.length < 7 or value.length > 200
    return false
  return true
, "Name should be between 7 and 200 characters long"
ModSchema.path("body").validate (value) ->
  if not @published or not @isSelected "body"
    return true
  if not value or value is ""
    return false
  if value.length < 50 or value.length > 2e5
    return false
  return true
, "Body should be between 50 and 200,000 characters long"

escapeHtml = (str) ->
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace />/g, "&gt;"

ModSchema.pre "save", (next) ->
  doc = @
  # Only if selected
  if @isSelected "name"
    doc.name = escapeHtml(doc.name)
  if @isSelected "summary"
    doc.summary = escapeHtml(doc.summary)
  #if @isSelected "body"
  #  doc.body = escapeHtml(doc.body)
  return next()


# Validation

fs = require "fs"


ModSchema.methods =
  fillDeps: (cb) ->
    q = mongoose.model("Version").find({"slaves.mod": @_id})
    q.populate "mod", "name author"
    q.exec (err, docs) ->
      cb err, docs

  fillCart: (cart)->
    @carted = true for mod in cart.mods when mod.toString() is @_id.toString()
    return

  fillStargazer: (luser) ->
    @starred = true for user in @stargazers when ""+user.id.toString() is ""+luser._id
    return


  addFile: (uid, path, version, cb) ->
    mongoose.model("Version").createFile uid, path, this, version, cb
    return

  deleteFile: (uid, cb) ->
    # TODO
    return


  ###
  Output:

  {
  "version1": {
  "path": "uid"
  }...
  }
  ###
  listVersion: (callback, processDeps=false) ->
    Version = mongoose.model "Version"
    self = @
    Version.find {mod: @_id}, (err, versions) ->
      if err then return callback undefined, err
      if !versions then return callback()
      output = {}
      for version in versions
        output[version.name] = output[version.name] or {}
        for file in version.files
          output[version.name][file.path] = file.uid
      if processDeps
        return self.fillDeps (err, deps) ->
          for version of output
            for dep in deps
              for file in dep.files
                output[version][file.path] = file.uid

          callback output

      callback output


ModSchema.statics =

  ###
  Find article by id

  @param {ObjectId} id
  @param {Function} cb
  @api private
  ###
  load: (data, cb) ->
    cartId = data.$cart_id
    user = data.$user
    lean = data.$lean
    populate = data.$populate
    data.$cart_id = data.$populate = data.$user = data.$lean = undefined
    query = @findOne(data)
    if lean
      query.lean()
    if populate
      query.populate "comments.author", "username"
      query.populate "author", "username"
    query.exec (err, mod) ->
      if cartId and mod
        return Cart.findById(cartId, (err, cart)->
          if !err and cart
            mod.fillCart cart
          if user
            mod.fillStargazer user
          cb(err, mod)
        )
      cb err, mod
    return


  ###
  List articles

  @param {Object} options
  @param {Function} cb
  @api private

  ###
  list: (options, cb) ->
    criteria = options.criteria or {}
    #criteria.published = true
    q = @find(criteria).sort(options.sort)
      .limit(options.perPage).populate("author", "username")
      .skip(options.perPage * options.page)
      .select("-body -comments")
    q.lean() if options.doLean
    q.exec (err, mods) ->
      if err or !mods
        return cb err, mods
      if options.cart
        Cart.findById(options.cart, (err, cart)->
          if !err and cart
            mod.fillCart cart for mod in mods
            cb(err, mods)
        )
       else
        cb(err, mods)

    return

mongoose.model "Mod", ModSchema
