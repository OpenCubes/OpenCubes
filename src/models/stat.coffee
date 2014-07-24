mongoose = require("mongoose")
Q = require "q"
schema = mongoose.Schema
  ref_id: mongoose.Schema.Types.ObjectId
  evt_type: String # "dl" or "view"
  day: String
  daily: Number
  hourly: mongoose.Schema.Types.Mixed

schema.methods =

schema.statics =
  hit: (type, refId, date=new Date()) ->
    Stat = mongoose.model "Stat"

    date = new Date date
    inc = {}
    inc["hourly.#{date.getHours()}"] = 1
    inc.daily = 1
    update = Stat.update
      evt_type: type
      ref_id: refId
      day: new TimeBucket(date).day
    ,
      $inc: inc
    ,
      upsert: true

    update.exec()

mongoose.model "Stat", schema
