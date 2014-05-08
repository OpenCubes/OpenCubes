perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"

exports.view = ((cartid, callback) ->
  Cart = mongoose.model "Cart"
  Cart.findById(cartid).populate("mods").exec((err, cart) ->
    errors.handleResult err, cart, callback
  )
).toPromise @

exports.addTo = ((cart, mod, callback) ->
  Cart = mongoose.model "Cart"
  Cart.findById cart, (err, cart) ->
    return callback error.throwError(err, "DATABASE_ERROR") if err
    cart.mods.push(mod)
    cart.save (err, cart) ->
      errors.handleResult err, cart, callback

).toPromise @

exports.create = ((callback) ->
  Cart = mongoose.model "Cart"
  cart = new Cart()
  cart.save (err, cart) ->
    errors.handleResult err, cart, callback
).toPromise @

