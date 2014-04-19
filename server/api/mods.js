(function() {
  var canThis, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  exports.list = (function(userid, options, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod;
      if (can === false) {
        return callback(new Error("unauthorized"));
      }
      if (options.perPage > 50) {
        return callback(new Error("invalid_args"));
      }
      Mod = mongoose.model("Mod");
      Mod.list(options, function(err, mods) {
        if (err) {
          return callback(err);
        }
        return Mod.count().exec(function(err, count) {
          mods.totalCount = count;
          return callback(mods);
        });
      });
    });
  }).toPromise(this);

  exports.view = (function(userid, slug, cart, user, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod;
      if (can === false) {
        return callback(new Error("unauthorized"));
      }
      Mod = mongoose.model("Mod");
      Mod.load({
        slug: slug,
        $cart_id: cart,
        $user: user
      }, function(err, mod) {
        if (err || !mod) {
          return callback(new Error("not_found"));
        }
        mod.htmlbody = require("../parser")(mod.body);
        return callback(mod);
      });
      return;
    });
  }).toPromise(this);

}).call(this);
