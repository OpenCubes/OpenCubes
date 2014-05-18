
utils = require("./utils")
paginator = require("../paginator.js")
url = require("url")
URI = require("URIjs")
check = require("check-types")
archiver = require("archiver")
send = require("send");
errors = error = require "../error"

###
Route for viewing mod
###
exports.view = (req, res) ->
  if req.user then user = req.user._id else user = ""
  app.api.mods.lookup(user, req.params.id, {cart: req.cookies.cart_id, loggedUser:  req.user, parse: true}).then((mod) ->
    console.log mod
    res.render "view.ect",
      mod: mod
      canEdit: (if req.user then if mod.author is req.user.id or req.user.role is "admin" then true else false)
      title: mod.name + " - OpenCubes"
    return
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"

# lists the mods
exports.index = (req, res) ->
  page = ((if req.params.page > 0 then req.param("page") else 1)) - 1
  sort = (req.param("sort")) or "date"
  filter = (req.param("filter")) or "all"
  perPage = 10
  options =
    perPage: perPage
    page: page
    sort: sort
    filter: filter
    criteria: ((if filter isnt "all" then category: filter else {}))
    cart: req.cookies.cart_id

  cart = req.cookies.cart_id
  # We get the params in the url -> Preserve the params in the links
  url_parts = url.parse(req.url, true)
  query = url_parts.search
  listing = new Date().getTime()
  if req.user then user = req.user._id else user = ""
  app.api.mods.list(user, options).then((mods, count) ->
    count = mods.totalCount
    res.render "index.ect", utils.ectHelpers(req,
      title: "Mods - OpenCubes"
      mods: mods
      page: page + 1
      pages: Math.ceil(count / perPage)
      pagination: paginator.create("search",
        prelink: ""
        current: page + 1
        rowsPerPage: perPage
        totalResult: count
        postlink: query
      ).render()
    )
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"

  return

exports.edit = (req, res) ->
  app.api.mods.load(req.getUserId(), req.params.id).then((container) ->
    res.render "edit/" + (req.params.section or "general") + ".ect",
      mod: container.mod
      deps: container.deps
      title: "Editing " + container.mod.name
      url: "/mods/" + container.mod.slug + "/edit"
      versions: container.versions
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"

exports.doEdit = (req, res) ->
  args = req.body
  app.api.mods.edit(req.getUserId(), req.params.id, args.name, args.value).then((status) ->
    res.send 200, "Saved!"
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"


exports.getLogo = (req, res) ->
  if !req.params.slug
    return res.send 403, "no slug"
  app.api.mods.getLogo(req.getUserId(), req.params.slug, false).then((mod) ->
    if(!mod.logo)
      return send(req, __dirname.getParent().getParent() + "/public/images/puzzle.png")
        .pipe(res)

    send(req, __dirname.getParent() + "/uploads/"+mod.logo)
      .pipe(res)
  ).fail (err) ->
      send(req, __dirname.getParent().getParent() + "/public/images/puzzle.png")
        .pipe(res)


uuid = require("node-uuid")
fs = require("fs")

exports.setLogo = (req, res) ->
  file = req.files.file
  if(!file)
    res.send 401, "missing file"
  uid = uuid.v4() + ".png"
  newfile = __dirname.getParent() + "/uploads/" + uid
  fs.rename file.path, newfile, (err) ->
    if err
      console.log err
      return res.send 500, "something went wrong while moving"
    app.api.mods.edit(req.getUserId(), req.params.id, "logo", uid).then((status) ->
      res.send 200, "Saved!"
    ).fail (err) ->
      errors.handleHttp err, req, res, "text"

###
Star a mod
###
exports.star = (req, res) ->
  slug = req.params.slug
  return res.send(400, "Missing slug")  if not slug or slug is ""
  return res.send(401, "You are not logged in")  unless req.user
  app.api.mods.star(req.getUserId(), req.params.slug).then((mod)->
    res.redirect "/mods/" + mod.slug
  ).fail (err)->
    errors.handleHttp err, req, res, "text"


exports.upload = (req, res) ->
  res.render "../views/upload.ect"
  return

exports.doUpload = (req, res) ->
  mod =
    name: req.body.name
    summary: req.body.summary
    body: req.body.description
    author: req.user._id
    category: req.body.category or "misc"
  app.api.mods.add(req.getUserId(), mod).then((mod)->
    if req.get("X-Triggered-By") is "Script"
      res.send 200,
        status: "success"
        redirectTo: "/mods/#{mod.slug}"
    else
      res.redirect "/"
  ).fail (err) ->
    errors.handleHttp err, req, res, "json"


exports.cart = (req, res) ->
  if(!req.params.id)
    res.reason = "Missing id"
    return utils.notfound(req, res, ->)
  app.api.cart.view(req.params.id).then((cart) ->
    res.render("users/cart.ect", {cart: cart})
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"



exports.search = (req, res) ->
  res.render "mods/search.ect"
  return
