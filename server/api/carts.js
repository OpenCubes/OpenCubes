(function() {
  var canThis, error, errors, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  errors = error = require("../error");

  exports.view = (function(cartid, callback) {
    var Cart;
    Cart = mongoose.model("Cart");
    return Cart.findById(cartid).populate("mods").exec(function(err, cart) {
      return errors.handleResult(err, cart, callback);
    });
  }).toPromise(this);

  exports.addTo = (function(cart, mod, callback) {
    var Cart;
    Cart = mongoose.model("Cart");
    return Cart.findById(cart, function(err, cart) {
      if (err) {
        return callback(error.throwError(err, "DATABASE_ERROR"));
      }
      cart.mods.push(mod);
      return cart.save(function(err, cart) {
        return errors.handleResult(err, cart, callback);
      });
    });
  }).toPromise(this);

  exports.create = (function(callback) {
    var Cart, cart;
    Cart = mongoose.model("Cart");
    cart = new Cart();
    return cart.save(function(err, cart) {
      return errors.handleResult(err, cart, callback);
    });
  }).toPromise(this);

}).call(this);
