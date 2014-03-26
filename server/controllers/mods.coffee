mongoose = require("mongoose")
Mod = mongoose.model("Mod")
utils = require("./utils")
paginator = require("../paginator.js")
url = require("url")
URI = require("URIjs")
check = require("check-types")
archiver = require("archiver")
exports.view = (req, res) ->
  setTimeout (->
    Mod.load
      slug: req.params.id
    , (err, mod) ->
      if err or not mod
        res.reason = "Mod not found"
        return utils.notfound(req, res, ->
        )
      mod.htmlbody = req.application.parser(mod.body)
      res.render ((if req.query.ajax then "../views/mods/view-body.ect" else "view.ect")),
        mod: mod
        canEdit: (if req.user then mod.author.equals(req.user.id) else false)
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
    
    # Check the section exists
    section = [
      "general"
      "description"
      "files"
    ].fetch(req.params.section, "general")
    mod.listVersion (v) ->
      console.log v
      res.render "../views/edit/" + section + ".ect",
        mod: mod
        title: "Editing " + mod.name
        url: "/mod/" + mod.slug + "/edit"
        versions: v

      return

    return

  return

exports.doEdit = (req, res) ->
  console.log req.body
  Mod.load
    slug: req.params.id
    author: req.user._id
  , (err, mod) ->
    return res.send(403, "You are not the author")  if err or not mod
    data = req.body
    
    # Check the section exists');
    console.log req.params.section
    section = [
      "general"
      "description"
      "files"
    ].fetch(req.params.section, "general")
    console.log section
    switch section
      when "general"
        map = check.map(
          name: data.name
          category: data.category
          summary: data.summary
        ,
          name: check.unemptyString
          category: check.unemptyString
          summary: check.unemptyString
        )
        unless check.every(map)
          req.flash "error", "Something is missing..."
          return res.render("../views/edit/" + section + ".ect",
            mod: mod
          )
        mod.name = data.name
        mod.category = data.category
        mod.summary = data.summary
        mod.save (err, doc) ->
          if err
            req.flash "error", "Something is missing..."
            return res.render("../views/edit/" + section + ".ect",
              mod: mod
              title: "Editing " + mod.name
              url: "/mod/" + mod.slug + "/edit"
            )
          req.flash "success", "Succesfully edited!"
          res.redirect "/mod/" + mod.slug + "/edit"

      when "description"
        unless data.body
          req.flash "error", "Something is missing..."
          return res.render("../views/edit/" + section + ".ect",
            mod: mod
          )
        mod.body = data.body
        mod.save (err, doc) ->
          if err
            req.flash "error", "Something is missing in mod..."
            return res.render("../views/edit/" + section + ".ect",
              mod: mod
              title: "Editing " + mod.name
              url: "/mod/" + mod.slug + "/edit"
            )
          req.flash "success", "Succesfully edited!"
          res.redirect "/mod/" + mod.slug + "/edit"

    return

  return

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

  cart = req.cookies.cart_id;
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
