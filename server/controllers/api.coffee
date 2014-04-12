exports.ajaxLogin = (req, res) ->
  res.render "forms/login.ect"
  return

exports.glyphicons = (req, res) ->
  data = require("../../public/api/glyphicons.json")
  console.log data
  res.render "utils/glyphicons.ect",
    list: data

  return

exports.parseMd = (req, res) ->
  res.send(req.application.parser(req.body.markdown or ""))


Mod = require("mongoose").model("Mod")
Cart = require("mongoose").model("Cart")

exports.addToCart = (req, res) ->
  id = req.params.id
  cart = req.params.cart
  if(!id or !cart)
    return res.send
      status: "error"
      id: "missing_param"
      code: 400
      message: "Something is missing..."

  Cart.findById(cart, (err, cart) ->
    if(err or !cart)
      return res.send(
        status: "error"
        id: "database_error"
        code: 500
        message: "An error has occured with the database"
      )
    cart.mods.push(id)
    cart.save()
    return res.send
      status: "success"
      code: 201
      message: "Successfully pushed to cart"
      data:
        id: id
        cart: cart
  )
exports.lsCart = (req, res)->
  id = req.params.cart
  Cart.findById(id).populate("mods").exec((err, cart) ->
    res.send cart
  )

exports.createCart = (req, res)->
  console.log "creeating cart"
  cart = new Cart()
  cart.save()
  res.send
    status: "success"
    code: 201
    message: "Successfully created cart"
    data:
      cart: cart

exports.search = (req, res) ->

  regex = new RegExp(req.params.string, 'i')
  console.log(regex)
  q = Mod.find({name: regex})
  q.populate("author", "username")
  q.exec (err,mods) ->
    return res.send(mods)
