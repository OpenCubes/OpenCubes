perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"
_  = require("lodash")
Q = require "q"
async = require "async"
Mod = mongoose.model "Mod"
Stat = mongoose.model "Stat"

exports.hit = (id, type, date) ->
  Stat.hit(type, id, date)

exports.get = (id, type, ts, span="hourly") ->
  deferred = Q.defer()
  console.log ts
  Stat = mongoose.model "Stat"
  
  q =
    ref_id: new mongoose.Types.ObjectId id
    evt_type: type
   if ts isnt "daily"
    q.day = ts
    query = Stat.findOne q
  else
    query = Stat.find q
    query.select "-hourly"
    query.sort "day"
  query.exec (err, doc)->
    array = []
    result = {}
    if ts isnt "daily"
      if doc and doc.hourly
        for i in [0..23]
          array.push doc.hourly[i] or 0
      else
        for i in [0..23]
          array.push 0
      result =
        data: array
        labels: [0..23]
      
    else
      r = /(\d+)-(\d+)-(\d+)/.exec doc[0].day
      
      # How many days since the first date?
      firstDate = new Date r[1], r[2], r[3]
      timeDiff = Math.abs Date.now() - firstDate.getTime() 
      diffDays = Math.ceil timeDiff / (1000 * 3600 * 24)
      docs = _.groupBy doc, "day"
      console.log docs, diffDays
      # We make a list of possible dates from beginning to today
      dates = []
      for i in [diffDays..0]
        dates.push new TimeBucket(Date.now() - i * 1000 * 3600 * 24).day
      
      # And we make a list of all the data
      data = []
      for i in dates
        if docs[i]
          data.push docs[i][0].daily
        else data.push 0
      array = data
      result =
        data: array
        labels: dates
      

    deferred.resolve result
  deferred.promise
