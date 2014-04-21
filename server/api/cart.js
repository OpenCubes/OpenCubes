(function() {
  var canThis, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  exports.view = (function(cartid, callback) {
    return Cart.findById(req.params.id).populate("mods").exec(function(err, cart) {
      return callback(err || cart);
    });
  }).toPromise(this);

}).call(this);
