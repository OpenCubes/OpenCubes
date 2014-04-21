(function() {
  var canThis, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  exports.view = (function(cartid, callback) {
    var Cart;
    Cart = mongoose.model("Cart");
    return Cart.findById(cartid).populate("mods").exec(function(err, cart) {
      return callback(err || cart);
    });
  }).toPromise(this);

  exports.addTo = (function(cart, mod, callback) {
    var Cart;
    Cart = mongoose.model("Cart");
    return Cart.findById(cart, function(err, cart) {
      if (err) {
        return callback(err);
      }
      cart.mods.push(mod);
      return cart.save(function(err, cart) {
        return callback(err || cart);
      });
    });
  }).toPromise(this);

  exports.create = (function(callback) {
    var Cart, cart;
    Cart = mongoose.model("Cart");
    cart = new Cart();
    return cart.save(function(err, cart) {
      return callback(err || cart);
    });
  }).toPromise(this);

}).call(this);
