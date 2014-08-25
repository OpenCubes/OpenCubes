perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require("mongoose-q")()
errors = error = require "../error"
_  = require("lodash")
Q = require "q"
Mod = mongoose.model "Mod"
User = mongoose.model "User"
Rating = mongoose.model "Rating"
###
Cast a vote
@param authorId the caster id
@param slug the mod slug

###
exports.castVote = (authorId, slug, rate) ->
  deferred = Q.defer()
  rate = Math.round rate
  mod = {}
  oldRate = 0
  # Find the mod id
  Mod.findOne(slug: slug).select("slug").execQ().then (doc) ->
    mod = doc

    # Find the rating
    Rating.findOneQ
      user: authorId
      mod: mod._id
  .then (rating) ->
    # If first vote then create it
    if not rating
      rating = new Rating
        user: authorId
        mod: mod._id
        rate: rate
    # Else get old vote and update it
    else
      oldRate = rating.rate
      rating.set("rate", rate)

    # Save it
    rating.saveQ()
  .then ->
    uRate = rate - oldRate
    uRateCount = if oldRate isnt 0 then 0 else 1
    Mod.updateQ slug: slug, {
      $inc:
        "cached.rating": uRate
        "cached.rating_count": if oldRate then 0 else 1
    }
  .then ->
    deferred.resolve rate: rate

  .fail (err) ->
    console.log err
    deferred.reject err
  deferred.promise
