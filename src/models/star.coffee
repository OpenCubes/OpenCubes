mongoose = require("mongoose")
require("./hit")
Schema = mongoose.Schema
  user:
    type: mongoose.Schema.Types.ObjectId
    ref: "User"
  mod:
    type: mongoose.Schema.Types.ObjectId
    ref: "Mod"
  time_bucket:
    raw: Date
    hour: String
    day: String
    week: String
    month: String
    quarter: String
    year: String


Schema.virtual("date").get () ->
  return time_bucket[0].raw
.set (date) ->
  date = new Date date
  @time_bucket = new TimeBucket date
Schema.methods =
Schema.statics =

mongoose.model "Star", Schema
