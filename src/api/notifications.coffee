Q = require "q"
mongoose = require "mongoose"
Subscription = mongoose.model 'Subscription'
_ = require "lodash"
AVAILABLE_FILTERS = ['release', 'comment', 'edit']

###
Creates a new subscription object
@return promise
@promise.arg the sid a unique id for each subscriptions
###
exports.createSubscription = ->
  deferred = Q.defer()
  sid = Math.floor(Math.random() * 10e25).toString 36
  sub = new Subscription sid: sid
  sub.save (err, sub) ->
    if err then return deferred.reject err
    deferred.resolve sid
  deferred.promise

###
Add a subscription to said subscription (list)
@param sid the subscription list sid
@param subject the subject
@param [filter] a list that filters notifications and only selects specified verbs
@return promise
@promise.arg the sid
###
exports.subscribe = (sid, subject, filters=AVAILABLE_FILTERS) ->
  deferred = Q.defer()
  filters = _.intersection filters, AVAILABLE_FILTERS
  Subscription.update sid: sid,
    $addToSet:
      subscriptions:
        obj: subject
        filter: filters
  , (err, r) ->
    if err then deferred.reject err else deferred.resolve sid
  deferred.promise

###
Get a subscription document and its notifications
@param sid its sid
@return promise
@promise.arg the document
###
exports.get = (sid) ->
  deferred = Q.defer()
  Subscription.findOne sid: sid
  .populate "notifications.nid"
  .exec (err, s) ->
    if err then deferred.reject err else deferred.resolve s
  deferred.promise
