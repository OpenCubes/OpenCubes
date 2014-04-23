(function() {
  var canThis, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

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
          return callback(new Error("unauthorized"));
        }
        return Mod.findOne({
          slug: dep
        }, function(err, dep) {
          if (err || !dep) {
            return callback(err || new Error("not_found"));
          }
          return Version.findOne({
            mod: dep._id,
            name: version
          }, function(err, version) {
            version.slaves.push({
              mod: mod._id
            });
            return version.save(function(err, version) {
              console.log(err || version);
              return callback(err || version);
            });
          });
        });
      });
    });
  }).toPromise(this);

}).call(this);
