mongoose = require("mongoose")
require("./hit")
Schema = mongoose.Schema(
  ref_id: mongoose.Schema.Types.ObjectId
  ref_type: String
  hits: [mongoose.model("Hit").Schema]
)
Schema.methods =
  hit: (hash, country, act0) ->
    Hit = mongoose.model "Hit"
    hit = new Hit
      ip_h: hash
      ctry: country
      act0: act0
      date: Date.now()
    @hits.push hit
    @save()
Schema.statics =
  fetch: ((id, type, callback) ->
    Stat = mongoose.model("Stat")
    Stat.findOne({ref_id: id, ref_type: type}, (err, doc) ->
      if err or not doc
        doc = new Stat()
        doc.ref_id = id
        doc.ref_type = type
        return doc.save (err, doc) ->
          if err then return callback err
          callback doc
       callback doc
      
    )
  ).toPromise @
  fetchAndHit: ((id, type, act0, ip, country, callback) ->
    mongoose.model("Stat").fetch(id, type).then((doc) ->
      doc.hit(ip, country, act0)
    ).fail (err) ->
      console.log err.stack
      callback err
  ).toPromise @

mongoose.model "Stat", Schema
