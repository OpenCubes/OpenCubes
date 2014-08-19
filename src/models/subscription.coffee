mongoose = require("mongoose")
Q = require "q"
Schema = mongoose.Schema
  sid: String
  unread: Number
  notifications: [
    nid:
      type: mongoose.Schema.Types.ObjectId
      ref: "GlobalNotification"
  ]

  subscriptions: [
    obj: mongoose.Schema.Types.ObjectId
    filter: [String]
  ]


Schema.methods =
  fill: ->
    deferred = Q.defer()
    promises = []
    for subscription in @notifications
      promises.push subscription.nid.fill(subscription._id)
    Q.all(promises).spread ->
      console.log arguments
      deferred.resolve Array::slice.call arguments, 0
    deferred.promise

Schema.statics =

mongoose.model "Subscription", Schema
