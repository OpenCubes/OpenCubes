mongoose = require("mongoose")
Schema = mongoose.Schema
Cart = mongoose.model("Cart")
slug = require("mongoose-slug")
timestamps = require("mongoose-times")
fs = require("fs")
ModSchema = mongoose.Schema(
  name: String
  version: String
  author:
    type: Schema.Types.ObjectId
    ref: "User"

  summary: String
  body: String
  logo: String
  dl_id: String
  creation_date: Date
  lmodified_date: Date
  category: String
  vote_count: Number
  stargazers: [
    id: Schema.Types.ObjectId
    date: Date
  ]
  comments: [
    author:
      type: Schema.Types.ObjectId
      ref: "User"
    title: String
    body: String
    date: Date
  ]
)
ModSchema.post 'remove',  (doc) ->
  console.log('`%s` has been removed', doc.name)
  # Remove the logo
  fs.unlink "../uploads/"+mod.logo, (err) ->
    if err then console.log err
    else console.log "File #{mod.logo} has been deleted"
  mongoose.model("Version").find {mod: @_id}, (err, versions) ->
    version.remove() for version in versions when version

ModSchema.path("name").required true, "Mod title cannot be blank"
ModSchema.path("body").required true, "Mod body cannot be blank"
ModSchema.path("author").required true, "Mod author cannot be blank"
ModSchema.path("summary").required true, "Mod summary cannot be blank"
ModSchema.plugin slug("name")
ModSchema.plugin timestamps

# Validation

fs = require "fs"


ModSchema.methods =
  fillDeps: (cb) ->
    q = mongoose.model("Version").find {"slaves.mod": @_id}
    q.populate "mod", "name author"
    q.exec cb

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
      if cartId
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
