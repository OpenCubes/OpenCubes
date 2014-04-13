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

exports.view = (req, res) ->
  setTimeout (->
    Mod.load
      slug: req.params.id
      $lean: true
    , (err, mod) ->
      if err or not mod
        console.log err if err
        return res.send(status("error", "404", "db_error", "Can't find mod `"+req.params.id+"`"))
      mod.htmlbody = req.application.parser(mod.body)
      mod.urls =
        web: "/mod/"+mod.slug
        logo: "/assets/"+mod.slug+".png"

      return res.send mod

    return
  ), 0
  return

exports.search = (req, res) ->

  regex = new RegExp(req.params.string, 'i')
  console.log(regex)
  q = Mod.find({name: regex})
  q.populate("author", "username")
  q.exec (err,mods) ->
    return res.send(mods)

exports.list = (req, res) ->
  page =  (req.params.page or 1)- 1
  sort = (req.param("sort")) or "-date"
  filter = (req.param("filter")) or "all"
  perPage = req.params.perPage or 25
  options =
    perPage: perPage
    page: page
    sort: sort
    filter: filter
    criteria: ((if filter isnt "all" then category: filter else {}))
    doLean: true

  Mod.list options, (err, mods) ->
    return res.send status("error", 500, "db_error", "Issues with database. Please retry or contact us")  if err
    Mod.count().exec (err, count) ->
      for mod in mods
        mod.urls =
          api: "/api/mods/view/"+mod.slug+".json"
          web: "/mod/"+mod.slug
          logo: "/assets/"+mod.slug+".png"
      res.send
        status: "success"
        mods: mods
        page: page + 1
        pages: Math.ceil(count / perPage)


    return

  return
