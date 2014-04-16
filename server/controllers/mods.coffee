mongoose = require("mongoose")
Mod = mongoose.model("Mod")
utils = require("./utils")
paginator = require("../paginator.js")
url = require("url")
URI = require("URIjs")
check = require("check-types")
archiver = require("archiver")
send = require("send");
exports.view = (req, res) ->
  setTimeout (->
    Mod.load
      slug: req.params.id
      $cart_id: req.cookies.cart_id
      $user: req.user
    , (err, mod) ->
      if err or not mod
        res.reason = "Mod not found"
        return utils.notfound(req, res, ->
        )
      mod.htmlbody = req.application.parser(mod.body)
      res.render ((if req.query.ajax then "../views/mods/view-body.ect" else "view.ect")),
        mod: mod
        canEdit: (if req.user then if mod.author is req.user.id or req.user.role is "admin" then true else false)
        title: mod.name + " - OpenCubes"
      , ((if req.query.ajax then (err, html) ->
        result = {}
        result.body = html
        res.send result
        return
       else undefined))
      return

    return
  ), 0
  return



exports.edit = (req, res) ->
  Mod.load
    slug: req.params.id
    author: req.user._id
  , (err, mod) ->
    return res.send(403, "You are not the author")  if err or not mod
    mod.fillDeps (err, deps)->
      if err
        console.log err
      # Check the section exists
      section = [
        "general"
        "description"
        "files"
        "dependencies"
      ].fetch(req.params.section, "general")
      mod.listVersion (v) ->
        console.log v
        res.render "edit/" + section + ".ect",
          mod: mod
          deps: deps
          title: "Editing " + mod.name
          url: "/mod/" + mod.slug + "/edit"
          versions: v
        return

      return

    return

exports.doEdit = (req, res) ->
  args = req.body
  Mod.findOne({slug: req.params.id, author: req.user._id}, (err, mod) ->
    if err or !mod
      if err then console.log err
      return res.send 403, "Please try again"
    if args.value and args.value isnt '' and args.name and args.name isnt ''
      mod[args.name] = args.value
      mod.save()
      return res.send 200, "Done!"
    return res.send 401, "Please fill the field"
  )


exports.getLogo = (req, res) ->
  if !req.params.slug
    return res.send 403, "no slug"
  Mod.findOne({slug: req.params.slug}, (err, mod) ->
    if(err or !mod)
      return res.send 500, "error"
    if(!mod.logo)
      return send(req, __dirname.getParent().getParent() + "/public/images/puzzle.png")
        .pipe(res)

    send(req, __dirname.getParent() + "/uploads/"+mod.logo)
      .pipe(res)
  )

uuid = require("node-uuid")
fs = require("fs")
exports.setLogo = (req, res) ->
  console.log(req.files)
  file = req.files.file
  if(!file)
    res.send 401, "missing file"
  uid = uuid.v4() + ".png"
  newfile = __dirname.getParent() + "/uploads/" + uid
  fs.rename file.path, newfile, (err) ->
    if err
      console.log err
      return res.send 500, "something went wrong while moving"
    slug = req.params.id
    Mod.load
      slug: slug
      , (err, mod) ->
        if err or not mod
          console.log(err)
          return res.send 500, "error with db"
        mod.logo = uid
        console.log("done!")
        mod.save()
        return res.send 200, "done"

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
  Mod.list options, (err, mods) ->
    return res.render("500")  if err
    Mod.count().exec (err, count) ->
      console.log ("  Loading mods took " + (new Date().getTime() - listing + " ms")).cyan
      res.render "../views/index.ect", utils.ectHelpers(req,
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
      return

    return

  return

exports.star = (req, res) ->
  slug = req.params.slug
  return res.send(400, "Missing slug")  if not slug or slug is ""
  return res.send(401, "You are not logged in")  unless req.user
  Mod.load
    slug: slug
    "stargazers.id": req.user.id
  , (err, doc) ->
    return res.send(500, "Unknown error on database...")  if err
    if doc
      doc.vote_count--
      doc.stargazers[0].remove()
      doc.save()
      res.redirect "/mod/" + slug
    else
      Mod.load
        slug: slug
      , (err, doc) ->
        return res.send(500, "Unknown error on database...")  if err
        doc.stargazers.push
          id: req.user._id
          date: Date.now()

        doc.vote_count = (doc.vote_count or 0) + 1
        doc.save()
        res.redirect "/mod/" + slug

    return

  return

exports.upload = (req, res) ->
  res.render "../views/upload.ect"
  return

exports.doUpload = (req, res) ->
  mod = new Mod(
    name: req.body.name
    summary: req.body.summary
    body: req.body.description
    author: req.user._id
    category: req.body.category or "misc"
  )
  mod.save (err, doc) ->
    console.log doc
    if err
      res.render "../views/upload.ect",
        hasError: true

    else
      res.redirect "/"
    return

  return

Cart = mongoose.model "Cart"

exports.cart = (req, res) ->
  if(!req.params.id)
    res.reason = "Missing id"
    return utils.notfound(req, res, ->
    )
  Cart.findById(req.params.id).populate("mods").exec((err, cart) ->
    if(err || !cart)
      res.reason = "DB Problem"
      return utils.notfound(req, res, ->)
    res.render("users/cart.ect", {cart: cart})
  )

exports.search = (req, res) ->
  res.render "mods/search.ect"
  return


