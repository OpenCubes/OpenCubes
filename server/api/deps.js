(function() {
  var canThis, error, errors, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  errors = error = require("../error");

  /*
  Add a dependency to a version
  @param userid the current logged user
  @param sug the mod slug
  @param name the title of the comment
  @param body the content of the comment
  @permission mod:edit
  */


  exports.add = (function(userid, slug, dep, version, callback) {
    return canThis(userid, "mod", "edit").then(function(can) {
      var Mod, Version;
      Mod = mongoose.model("Mod");
      Version = mongoose.model("Version");
      Mod.findOne({
        slug: slug
      }, function(err, mod) {
        if (can === false && mod.author.equals(userid) !== true) {
          return callback(error.throwError("Unathorized", "UNAUTHORIZED"));
        }
        return Mod.findOne({
          slug: dep
        }, function(err, dep) {
          if (err) {
            return callback(error.throwError(err, "DATABASE_ERROR"));
          }
          if (!dep) {
            return callback(error.throwError("Can't found dependency", "NOT_FOUND"));
          }
          return Version.findOne({
            mod: dep._id,
            name: version
          }, function(err, version) {
            version.slaves.push({
              mod: mod._id
            });
            return version.save(function(err, version) {
              return errors.handleResult(err, version, callback);
            });
          });
        });
      });
    });
  }).toPromise(this);

}).call(this);
