mongoose = require("mongoose")
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
Schema.statics =

mongoose.model "Subscription", Schema
