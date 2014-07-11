mongoose = require("mongoose")
Q = require "q"
schema = mongoose.Schema
  ref_id: mongoose.Schema.Types.ObjectId
  evt_type: String # "dl" or "view"
  hits: mongoose.Schema.Types.Mixed
  total: Number

schema.methods =
  hit: (date=new Date()) ->
    # We create empty fields if necessary
    @hits = @hits or {}

    @hits[date.getFullYear()] = @hits[date.getFullYear()] or {}
    @hits[date.getFullYear()][date.getMonth()] =
      @hits[date.getFullYear()][date.getMonth()] or {}
    @hits[date.getFullYear()][date.getMonth()][date.getDate()] =
      @hits[date.getFullYear()][date.getMonth()][date.getDate()] or {}

    @hits[date.getFullYear()][date.getMonth()][date.getDate()][date.getHours()] =
      @hits[date.getFullYear()][date.getMonth()][date.getDate()][date.getHours()] + 1 or 1

    @total = @total + 1 or 1
    @markModified "hits"


schema.statics =
  hit: (type, refId, date=new Date()) ->
    deferred = Q.defer()
    Stat = mongoose.model "Stat"
    date = new Date date
    refId = new mongoose.Types.ObjectId refId
    Stat.findOne(ref_id: refId, evt_type: type).exec().then (stat) ->
      if stat
        stat.hit date
        stat.save (err, doc) ->
          if err then return deferred.reject err
          deferred.resolve doc
        return
      stat = new Stat
        ref_id: refId
        evt_type: type
      stat.hit date
      stat.save (err, doc) ->
        if err then return deferred.reject err
        deferred.resolve doc
      return
    , console.log
    deferred.promise
mongoose.model "Stat", schema
