mongoose = require("mongoose")
Schema = mongoose.Schema(
  type: String # edition, post, deletion or !comment
  date: Date
  author: mongoose.Schema.Types.ObjectId
  mod_name: String
  link: String
)
Schema.virtual("description").get () ->
  if @type is "edition"
    return "edited mod"
  if @type is "post"
    return "published a new mod"
  if @type is "deletion"
    return "deleted mod"
Schema.methods = {}
Schema.statics = 
  createQuery: () ->
    console.log "CREATING"
    query = @find.apply(@, Array.prototype.slice.call(arguments))
    query.populate "mod", "name summary"

mongoose.model "Feed", Schema
