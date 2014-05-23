mongoose = require("mongoose")
Schema = mongoose.Schema(
  ip_h: String
  ctry: String
  date: Date
  act0: String
)
Schema.pre 'save', (next) ->
  @date = Date.now()
  next()
Schema.methods =
Schema.statics =
mongoose.model "Hit", Schema
