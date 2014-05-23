###

This module is the main part 
for pushing things such as stats, notifications or whatever

###
crypto = require "crypto"
exports.stats =
 mod: {}
geoip = require('geoip-lite')
mongoose = require("mongoose")
# download mod stat


createHash = (str, salt) ->
  sha = crypto.createHash("sha1").update(salt + str + salt).digest("hex")
  hash = 0
  if sha.length isnt 0
    i = 0
    while i < sha.length
      char = sha.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash # Convert to 32bit integer
      i++
   hash = hash.toString(36)
   console.log hash
   hash.substring(1, hash.length)

exports.stats.mod.download = (ip, mod, version) ->
  # At first we hash and salt the ip
  lookup = geoip.lookup(ip)
  country = if lookup then lookup.country else ""
  mongoose.model("Version").findOne({mod: mod, name: version}, (err, v) ->
    hash = createHash(ip, mod)
    mongoose.model("Stat").fetchAndHit(v._id, "Version", "dl", hash, country)
  )
 
 
