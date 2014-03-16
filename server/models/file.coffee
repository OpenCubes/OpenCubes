mongoose = require("mongoose")
Schema = mongoose.Schema
FileSchema = mongoose.Schema(
  uid: String
  path: String
  version: Schema.Types.ObjectId
)
FileSchema.methods = {}
FileSchema.statics = createFile: (uid, path, mod, version, cb) ->
  self = this
  func = (v) ->
    file = new self(
      uid: uid
      version: v._id
      path: path
    )
    file.save cb
    return

  if typeof version is "string"
    return mod.getOrCreateVersion(version, (err, doc) ->
      return cb(err)  if err
      return cb()  unless doc
      console.log "doc:", doc
      func doc
      return
    )
  func version
  return

mongoose.model "File", FileSchema
