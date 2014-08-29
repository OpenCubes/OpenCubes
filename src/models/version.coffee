mongoose = require("mongoose")
fs = require("fs")
Schema = mongoose.Schema(
  name: String
  author:
    type: mongoose.Schema.Types.ObjectId
    ref: "User"
  mod:
    type: mongoose.Schema.Types.ObjectId
    ref: "Mod"
  files: [
    path: String
    uid: String
  ]
  # When a mod depends on a version o an other mod, it is a slave
  slaves: [
    mod:
      type: mongoose.Schema.Types.ObjectId
      ref: "Mod"
  ]

)
Schema.post 'remove',  (doc) ->

  console.log('`%s` has been removed', doc.name)
  # Remove the files
  for file in @files
    if file and file.uid
      fs.unlink "#{__dirname.getParent()}/uploads/#{file.uid}", (err) ->
        if err then console.log err
        else console.log "File #{file.uid} has been deleted"

Schema.pre 'save', true, (next, done) ->
  next()
  Mod = mongoose.model "Mod"
  if @isNew
    GlobalNotification = mongoose.model "GlobalNotification"
    GlobalNotification.notify
      author: @author._id or @author
      subject: @mod._id or @mod
      object_id: @_id
      verb: "release"
    Mod.update _id: @mod._id or @mod, {
      '$addToSet': {
        'cached.versions': @name
      },
      '$inc': {
        'cached.versions_count': 1
      }
    }, console.log
  done()

Schema.methods = {}
Schema.statics = createFile: (uid, path, modId, v, cb) ->
  self = @

  if typeof v is "string"
    self.findOne {name: v, mod: modId}, (err, version) ->
      if err then cb err
      if version
        version.files.push
          path: path
          uid: uid
        version.save(cb)
      else
        self.create
          mod: modId
          name: v
          files: [
            path: path
            uid: uid
          ]
          , cb
mongoose.model "Version", Schema
