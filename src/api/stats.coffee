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

exports.get = (id, type, ts) ->
  deferred = Q.defer()
  console.log ts
  Stat = mongoose.model "Stat"
  q =
    ref_id: new mongoose.Types.ObjectId id
    evt_type: type
    day: ts
  console.log q
  Stat.findOne q
  .exec (err, doc)->
    console.log doc
    array = []
    if doc and doc.hourly
      for i in [0..23]
        array.push doc.hourly[i] or 0
    else
      for i in [0..23]
        array.push 0

    deferred.resolve array
  deferred.promise
