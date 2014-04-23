(function() {
  var canThis, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  /*
  Returns an user
  @param userid the current logged user
  @param name the name of the user
  @permission user:browse
  */


  exports.view = (function(userid, name, callback) {
    return canThis(userid, "user", "browse").then(function(can) {
      var User;
      if (can === false) {
        return callback(new Error("unauthorized"));
      }
      User = mongoose.model("User");
      User.findOne({
        username: name
      }).exec(function(err, user) {
        return callback(err || user);
      });
    });
  }).toPromise(this);

  /*
  Creates an user
  @param userid the current logged user
  @param data the options of the user
  @permission user:add
  */


  exports.registerLocal = (function(userid, data, callback) {
    return canThis(userid, "user", "browse").then(function(can) {
      var User, user;
      if (can === false) {
        return callback(new Error("unauthorized"));
      }
      User = mongoose.model("User");
      user = new User({
        username: data.username,
        email: data.email,
        password: data.password,
        provider: "local"
      });
      return user.save(function(err, user) {
        return callback(err || user);
      });
    });
  }).toPromise(this);

}).call(this);
