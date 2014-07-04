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

Date::getWeek = ->
  d = new Date @
  d.setHours(0,0,0)
  d.setDate(d.getDate()+4-(d.getDay()||7))
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)

Date::getQuarter = ->
  d = @
  q = [4,1,2,3]
  return q[Math.floor(d.getMonth() / 3)]


Schema.virtual("date").get () ->
  return time_bucket[0].raw
.set (date) ->
  date = new Date date
  @time_bucket =
    raw:      date
    hour:     "#{date.getFullYear()}-#{date.getMonth()}-#{date.getDate()}-#{date.getHours()}"
    day:      "#{date.getFullYear()}-#{date.getMonth()}-#{date.getDate()}"
    week:     "#{date.getFullYear()}-#{date.getMonth()}-#{date.getWeek()}"
    month:    "#{date.getFullYear()}-#{date.getMonth()}"
    quarter:  "#{date.getFullYear()}-#{date.getQuarter()}"
    year:     "#{date.getFullYear()}"

Schema.methods =
Schema.statics =

mongoose.model "Star", Schema
