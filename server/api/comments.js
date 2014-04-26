(function() {
  var canThis, errors, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  errors = require("../error");

  /*
  Add a comment to a mod
  @param userid the current logged user
  @param sug the mod slug
  @param name the title of the comment
  @param body the content of the comment
  @permission comment:add
  */


  exports.add = (function(userid, slug, name, body, callback) {
    return canThis(userid, "comment", "add").then(function(can) {
      var Mod;
      if (can === false) {
        return callback(error.throwError(err, "UNAUTHORIZED"));
      }
      Mod = mongoose.model("Mod");
      Mod.findOne({
        slug: slug
      }, function(err, mod) {
        if (err) {
          return callback(error.throwError(err, "DATABASE_ERROR"));
        }
        mod.comments.push({
          title: validator.escape(name),
          body: validator.escape(body),
          date: Date.now(),
          author: userid
        });
        return mod.save(function(err, mod) {
          return errors.handleResult(err, mod, callback);
        });
      });
    });
  }).toPromise(this);

}).call(this);
