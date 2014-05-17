mongoose = require("mongoose")
Schema = mongoose.Schema(
  name: String
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
