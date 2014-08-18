mongoose = require("mongoose")
Schema = mongoose.Schema
  author:
    type: mongoose.Schema.Types.ObjectId
    ref: "User"

  subject:
    type: mongoose.Schema.Types.ObjectId

  object_id:
    type: mongoose.Schema.Types.ObjectId

  verb: String

  date: Date


Schema.methods =
Schema.statics =
  notify: (object) ->
    Subscription = mongoose.model "Subscription"
    n = new @(object)
    n.date = n.date or new Date()
    n.save (err, obj) ->
      id = obj._id
      Subscription.update {
        'subscriptions.obj': object.subject
        'subscriptions.filter': object.verb
      }, {
        '$addToSet': {
          'notifications': {
            'nid': id
          }
        },
        '$inc': {
          'unread': 1
        }
      }, multi: true, console.log


mongoose.model "GlobalNotification", Schema
