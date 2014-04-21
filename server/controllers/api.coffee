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

exports.addToCart = (req, res) ->
  id = req.params.id
  cart = req.params.cart
  if(!id or !cart)
    return res.send
      status: "error"
      id: "missing_param"
      code: 400
      message: "Something is missing..."
  app.api.carts.addTo(cart, id).then((cart) ->
    return res.send
      status: "success"
      code: 201
      message: "Successfully pushed to cart"
      data:
        id: id
        cart: cart
  ).fail (err)->


exports.lsCart = (req, res)->
  id = req.params.cart
  app.api.carts.view(id).then((cart) ->
    res.send cart
  ).fail (err) ->
    console.log err
    return res.send
      status: "error"
      id: "database_error"
      code: 500
      message: "An error has occured with the database"


exports.createCart = (req, res)->
  app.api.carts.create().then((cart) ->
    res.send
      status: "success"
      code: 201
      message: "Successfully created cart"
      data:
        cart: cart
  ).fail (err) ->
    console.log err
    return res.send
      status: "error"
      id: "database_error"
      code: 500
      message: "An error has occured with the database"

exports.view = (req, res) ->
  if req.user then user = req.user._id else user = ""
  app.api.mods.view(user, req.params.id, req.cookies.cart_id,  req.user, true).then((mod) ->
    mod.urls =
      web: "/mod/"+mod.slug
      logo: "/assets/"+mod.slug+".png"
    return res.send mod
  ).fail (err) ->
    res.send 500, err.message
  return

exports.search = (req, res) ->
  app.api.mods.search(req.getUserId(), req.params.string).then((mods)->
    return res.send(mods.slice(-40))
  ).fail (err) ->
    res.send 500, err.message
  return

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

  if req.user then user = req.user._id else user = ""
  app.api.mods.list(user, options).then((mods, count) ->
    count = mods.totalCount
    for mod in mods
      mod.urls =
        api: "/api/mods/view/"+mod.slug+".json"
        web: "/mod/"+mod.slug
        logo: "/assets/"+mod.slug+".png"
    res.send
      status: "success"
      mods: mods
      count: mods.count
      page: page + 1
      pages: Math.ceil(count / perPage)


    return
  ).fail (err) ->
    console.log err
    res.send 500, err.message

  return
