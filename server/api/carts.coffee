perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"

exports.view = ((cartid, callback) ->
  Cart = mongoose.model "Cart"
  Cart.findById(cartid).populate("mods").exec((err, cart) ->
    callback err or cart
  )
).toPromise @

exports.addTo = ((cart, mod, callback) ->
  Cart = mongoose.model "Cart"
  Cart.findById cart, (err, cart) ->
    return callback err if err
    cart.mods.push(mod)
    cart.save (err, cart) ->
      callback err or cart

).toPromise @

exports.create = ((callback) ->
  Cart = mongoose.model "Cart"
  cart = new Cart()
  cart.save (err, cart) ->
    callback err or cart
).toPromise @

