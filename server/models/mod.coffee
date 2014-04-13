mongoose = require("mongoose")
Schema = mongoose.Schema
Cart = mongoose.model("Cart")
slug = require("mongoose-slug")
timestamps = require("mongoose-times")
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
  deps:[
    name: String
    id: Schema.Types.ObjectId
  ]
  versions: [name: String]
)
ModSchema.path("name").required true, "Mod title cannot be blank"
ModSchema.path("body").required true, "Mod body cannot be blank"
ModSchema.plugin slug("name")
ModSchema.plugin timestamps

ModSchema.methods =
  fillDeps: (cb) ->
    ids = []
    ids.push dep.id for dep in @deps
    console.log "ids", ids
    $this = @
    q = mongoose.model("Mod").find "versions._id": {$in: ids}
    q.select "name versions deps"
    q.exec (err, mods) ->
      cb(mods)

  fillCart: (cart)->
    @carted = true for mod in cart.mods when mod.toString() is @_id.toString()
    return

  fillStargazer: (luser) ->
    @starred = true for user in @stargazers when ""+user.id.toString() is ""+luser._id
    return

  addVersion: (data, cb) ->
    v = @versions.push(data)
    self = this
    @save (err, doc) ->
      return cb(err)  if err
      self.getVersion data, cb
      return

    return

  getVersion: (data, cb) ->
    v = @versions.findIn(data)
    console.log v
    cb `undefined`, v

  
  ###
  Create the version by name if it does not exists
  ###
  getOrCreateVersion: (name, cb) ->
    self = this
    @getVersion
      name: name
    , (err, doc) ->
      if not doc or err or doc is -1
        return self.addVersion(
          name: name
        , cb)
      cb err, doc
      return

    return

  addFile: (uid, path, version, cb) ->
    mongoose.model("File").createFile uid, path, this, version, cb
    return

  deleteFile: (uid, cb) ->
    mongoose.model("File").remove
      uid: uid
    , cb
    return

  
  ###
  Output:
  
  {
  "version1": {
  "path": "uid"
  }...
  }
  ###
  listVersion: (cb, processDeps=false) ->
    File = mongoose.model("File")
    versions = []
    versions.push v._id for v in @versions


    console.log "versions:", versions
    # We copy the deps and the versions b/c in the callack `this` doesn't work
    $versions = @versions
    $deps = @deps
    res = []
    File.find
      version: {$in: versions}, (err, files) ->

        res.push file for file in files
        data = {}
        for f in res
          for v in $versions
            if v._id.toString() is f.version.toString()
              data[v.name] = data[v.name] or {}
              data[v.name][f.path] = f.uid
        # if We are to add the deps
        if processDeps is true
          versions = []
          console.log "deps:", $deps
          versions.push v.id for v in $deps
          console.log("vs:", versions)
          return File.find
            version: {$in: versions}, (err, files) ->
              console.log("files:", files)
              res = []
              res.push file for file in files
              console.log("res:", res)
              for f in res
                for v of data
                  console.log "vf:", v, f
                  data[v][f.path] = f.uid
              console.log(data)
              return cb(data)


        console.log(data)
        return cb(data)

    return

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
    data.$cart_id = data.$user = data.$lean = undefined
    query = @findOne(data)
    if lean
      query.lean()
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
