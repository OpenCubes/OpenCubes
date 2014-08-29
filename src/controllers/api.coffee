errors = require("../error")
qfs = require("q-io/fs")
fs = require("fs")
uuid = require("node-uuid")
###
Parses and validates options according regex
###
parse = (regexpMeta, regexpCriterias, query) ->
  criterias = {}
  options = {}
  # push query if validated
  for own key, value of query
    if key.match regexpCriterias
      criterias[key] = value

    else if key.match regexpMeta
      options[key] = value

  {
    options: options
    criterias: criterias
  }

### Http api ###

exports.routes =
  v1:
    notifications:
      get: (req, res)->
        app.api.notifications.get(req.params.sid).then (doc) ->
          res.jsonp result: doc
      getNotifications: (req, res)->
        app.api.notifications.getNotifications(req.params.sid).then (doc) ->
          res.jsonp result: doc
      subscribe: (req, res) ->
        app.api.notifications.subscribe(req.params.sid, req.body.subject, req.body.filters).then (sid) ->
          res.jsonp
            sid: sid
      markAsRead: (req, res) ->
        app.api.notifications.markAsRead(req.params.sid, req.params.nid)
        res.send 200
      create: (req, res) ->
        app.api.notifications.createSubscription().then (sid) ->
          res.jsonp
            sid: sid
    stats:
      mods:
        views: (req, res) ->
          app.api.mods.check(req.params.slug).then (mod) ->
            app.api.stats.get(mod._id, "view", req.params.ts)
          .then (r) ->
            res.jsonp result: r
        stars: (req, res) ->
          app.api.mods.getStats(req.getUserId(), req.params.slug, "stars", req.params.type).then (stats) ->
            res.jsonp {
              result: stats
              status: "success"
            }
          .fail (err) ->
            res.jsonp {
              result: []
              status: "error"
            }

    mods:
      # remove: (req, res) ->
      # create: (req, res) ->

      edit: (req, res) ->
        app.api.mods.put(req.getUserId(), req.params.slug, req.body).then((status) ->
          return res.jsonp
            status: "success",
            result: status
        ).fail (err) ->
          console.log err
          res.jsonp 500, {
            status: "error"
            result: {}
          }

      get: (req, res) ->
        if req.user then user = req.user._id else user = ""
        app.api.mods.lookup(user, req.params.slug).then((mod) ->
          mod.urls =
            web: "/mods/"+mod.slug
            logo: "/assets/"+mod.slug+".png"
          return res.jsonp {
            status: "success",
            result: mod
          }

        ).fail (err) ->
          res.jsonp 500, {
            status: "error"
            result: {}
          }
      list: (req, res) ->
        regexpMeta      = /sort|skip|limit/
        regexpCriterias = /name|description|summary|category|slug|author/

        r = parse regexpMeta, regexpCriterias, req.query

        app.api.mods.itemize(r.criterias, r.options).then((result) ->

          res.jsonp result
        ).fail (err) ->
          console.log err
          res.jsonp 500, {
            status: "error"
            result: {}
          }
      delete: (req, res) ->
        app.api.mods.removeMod(req.user._id, req.params.slug).then ->
          res.json status: "success"
        .fail (err) ->
          console.log err
          err.send req, res

    users:
      get: (req, res) ->
        app.api.users.view(req.getUserId(), req.params.name).then((user) ->
          res.jsonp
            status: "success"
            result: user
        ).fail (err) ->
          errors.handleHttp err, req, res, "text"
      delete: (req, res) ->
        app.api.users.deleteAccount(req.getUserId(), req.params.name).then (r) ->
          res.jsonp
            status: "success"
            result: r
        .fail (err) ->
          console.log err
          if err.send then return err.send res, res

      mods: (req, res) ->
      list: (req, res) ->
        regexpMeta      = /sort_by|skip|limit/
        regexpCriterias = /username/

        r = parse regexpMeta, regexpCriterias, req.query

        app.api.users.itemize(r.criterias, r.options).then((result) ->
          res.jsonp result
        ).fail (err) ->
          console.log err
          res.jsonp 500, {
            status: "error"
            result: {}
          }
    versions:
      list: (req, res) ->
        app.api.mods.getVersions(req.params.slug).then (r) ->
          res.jsonp r
      get: (req, res) ->
        app.api.mods.getVersion(req.params.slug, req.params.name.replace("_", "#")).then (r) ->
          res.jsonp r
      add: (req, res) ->
        app.api.mods.addVersion(req.params.slug, req.body.name).then (r) ->
          res.jsonp r
      remove: (req, res) ->
        app.api.mods.removeVersion(req.user._id, req.params.slug,
            req.params.name.replace("_", "#")).then ->
              res.json 200, status: "success"
        .fail (err)->
          res.json err.message
      files:
        get: (req, res) ->
        add: (req, res) ->

          if req.getUserId() is "" or not req.getUserId()
            return res.send 401
          path = req.body.path
          slug = req.params.slug
          versionName = req.params.name.replace "_", "#"

          uid = uuid.v4()
          # Get the params
          newfile = __dirname.getParent() + "/uploads/" + uid
          file = req.files.file


          handleErr = (err) ->
            console.log(err)
            return res.send 500, {error: "error"}


          # Do the job
          qfs.rename(file.path, newfile).then(() ->
            return app.api.mods.addFile(req.getUserId(), slug, uid, path, versionName)
          , handleErr).then((doc) ->
            res.send 200
          , handleErr).fail handleErr

          return
        remove: (req, res) ->
          app.api.mods.removeFile(req.user._id, req.params.slug,
            req.params.name.replace('_', '#'), req.params.uid).then ->
              res.json 200, status: "success"
          .fail (err) ->
            console.log err.stack
            res.json err

    ratings:
      post: (req, res) ->

        app.api.ratings.castVote(req.user._id,
          req.params.slug, req.body.rate).then (data) ->
          res.jsonp data
        .fail (data) ->
          res.jsonp data
      get:  (req, res) ->

        app.api.ratings.getVote(req.user._id, req.params.slug).then (data) ->
          res.jsonp
            status: "success"
            rating: data
        .fail (data) ->
          res.jsonp data





exports.ajaxLogin = (req, res) ->
  res.render "forms/login.ect"
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
    errors.handleHttp err, req, res, "json"


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
    errors.handleHttp err, req, res, "json"


exports.search = (req, res) ->
  app.api.mods.search(req.getUserId(), req.params.string).then((mods)->
    return res.send((mods or []).slice(-40))
  ).fail (err) ->
    errors.handleHttp err, req, res, "json"
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
        web: "/mods/"+mod.slug
        logo: "/assets/"+mod.slug+".png"
    res.send
      status: "success"
      mods: mods
      count: mods.count
      page: page + 1
      pages: Math.ceil(count / perPage)


    return
  ).fail (err) ->
    errors.handleHttp err, req, res, "json"

  return
