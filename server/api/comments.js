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
        return callback(errors.throwError(err, "UNAUTHORIZED"));
      }
      Mod = mongoose.model("Mod");
      Mod.findOne({
        slug: slug
      }, function(err, mod) {
        if (err) {
          return callback(errors.throwError(err, "DATABASE_ERROR"));
        }
        if (!name || name.length < 5) {
          return callback(errors.throwError("Name must be at least 5 characters long", "INVALID_PARAMS"));
        }
        if (!body || body.length < 15) {
          return callback(errors.throwError("Body must be at least 15 characters long", "INVALID_PARAMS"));
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
