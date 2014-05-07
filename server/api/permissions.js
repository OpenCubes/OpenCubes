(function() {
  var config, mongoose, process;

  mongoose = require("mongoose");

  /*
  This utility function determine whether an user can do this or this
  using the permissions. e. g. "mod" "delete"
  
  @param userId the id of the user
  @param object the current object name ("mod", "user"...)
  @param action to be executed on the object (delete, edit, browse...)
  @param owner the optional owner id of the object to be "actionned"
  */


  exports.canThis = (function(userId, object, action, ownerId, callback) {
    var User;
    User = mongoose.model("User");
    if (typeof ownerId === "function") {
      callback = ownerId;
      ownerId = void 0;
    }
    if (userId === "") {
      return process(void 0, object, action, ownerId, callback);
    }
    return User.findById(userId, function(err, user) {
      if (err) {
        return callback(err);
      }
      return process(user, object, action, ownerId, callback);
    });
  }).toPromise(this);

  process = function(user, object, action, ownerId, callback) {
    var act, actions, group, obj, objAction, role, _i, _len;
    if (user) {
      role = user.role || "user";
    }
    group = config.user_groups[role || "guest"];
    if (!group) {
      return callback(new Error("No suitable group"));
    }
    actions = group.allowedActions;
    for (_i = 0, _len = actions.length; _i < _len; _i++) {
      objAction = actions[_i];
      if (!(objAction.indexOf(object === 0))) {
        continue;
      }
      act = objAction.split(":")[1];
      obj = objAction.split(":")[0];
      if (act.split(" ").indexOf(action) !== -1 && obj === object) {
        return callback(true);
      }
    }
    return callback(false);
  };

  config = require("../config");

}).call(this);
