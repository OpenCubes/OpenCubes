auth = require("./middlewares/auth.js")
flood = require("./middlewares/flood.js")
module.exports = (app) ->
  timer = new Date().getTime()
  app.server.get "/", app.controllers.mods.browse
  app.server.get "/browse", app.controllers.mods.browse
  app.server.get "/mods(/page/:page)?", app.controllers.mods.index

  app.server.get "/search", app.controllers.mods.search
  app.server.get "/mods/:id", app.controllers.mods.view

  app.server.get "/assets/:slug.png", app.controllers.mods.getLogo

  app.server.get "/mods/:id/edit/(:section)?", auth.requiresLogin, app.controllers.mods.edit

  app.server.post "/mods/:id/edit/files", auth.requiresLogin, app.bodyParser, app.controllers.files.upload
  app.server.post "/mods/:id/edit/(:section)?/post", auth.requiresLogin, app.controllers.mods.doEdit

  app.server.post "/mods/:slug/edit/dependencies", auth.requiresLogin, app.bodyParser, app.controllers.deps.add
  app.server.post "/mods/:id/edit/logo/upload", app.bodyParser, app.controllers.mods.setLogo

  app.server.get "/mods/:id/download", app.controllers.files.download
  app.server.get "/file/:uid/delete", auth.requiresLogin, app.controllers.files.remove

  app.server.get "/star/:slug", auth.requiresLogin, app.controllers.mods.star

  app.server.get "/upload", auth.requiresLogin, app.controllers.mods.upload
  app.server.get "/login", app.controllers.users.login

  app.server.post "/login", (req, res, next) ->
    app.passport.authenticate("local", (err, user, info) ->
      return next(err)  if err
      unless user
        if req.accepts("html")
          req.flash "error", "Invalid username or password"
          return res.redirect("/login" + ((if req.body.target then "?target=" + req.body.target else "")))
        else return res.send(error: "invalid_credentials")  if req.accepts("json")
      req.logIn user, (err) ->
        return next(err)  if err
        if req.accepts("html")
          return res.redirect(req.body.target or "/")
        else return res.send({})  if req.accepts("json")
        return

      return
    ) req, res, next
    return

  app.server.get  "/cart/:id", app.controllers.mods.cart
  app.server.get  "/signup", app.controllers.users.signup

  app.server.get  "/users/:name", app.controllers.users.show
  app.server.get  "/users/:name/edit", app.controllers.users.edit
  app.server.post "/users/:name/edit", app.bodyParser, app.controllers.users.doEdit

  app.server.get  "/recover",       app.controllers.users.requestPasswordRecovery
  app.server.post "/recover",       app.bodyParser, app.controllers.users.doRequestPasswordRecovery
  app.server.get  "/recover/:uid",  app.controllers.users.recover
  app.server.post "/recover/:uid",  app.bodyParser, app.controllers.users.doRecover
  app.server.post "/signup",        app.controllers.users.create
  app.server.post "/upload",        auth.requiresLogin, app.controllers.mods.doUpload
  app.server.get  "/logout", (req, res) ->
    req.logout()
    res.redirect "/"
    return
  # Admin panel
  app.server.get  "/admin/mods", app.controllers.admin.mods

  # API

  app.server.get  "/api/v1/mods",      app.controllers.api.routes.v1.mods.list
  app.server.get  "/api/v1/mods/:slug", app.controllers.api.routes.v1.mods.get
  app.server.put  "/api/v1/mods/:slug", app.controllers.api.routes.v1.mods.edit

  app.server.get  "/api/v1/users", app.controllers.api.routes.v1.users.list

  app.server.get   "/api/v1/versions/:slug",  app.controllers.api.routes.v1.versions.list
  app.server.get   "/api/v1/versions/:slug/:name",  app.controllers.api.routes.v1.versions.get
  app.server.post  "/api/v1/versions/:slug",  app.controllers.api.routes.v1.versions.add
  app.server.get   "/api/v1/versions/:slug/:name/*",  app.controllers.api.routes.v1.versions.files.get
  app.server.post  "/api/v1/versions/:slug/:name",  app.bodyParser, app.controllers.api.routes.v1.versions.files.add

  app.server.get   "/api/v1/stats/:slug/stars/:type", app.controllers.api.routes.v1.stats.mods.stars
  app.server.get   "/api/v1/stats/:slug/views/:ts", app.controllers.api.routes.v1.stats.mods.views

  app.server.post  "/api/v1/subscriptions",  app.bodyParser, app.controllers.api.routes.v1.notifications.create
  app.server.post  "/api/v1/subscriptions/:sid",  app.bodyParser, app.controllers.api.routes.v1.notifications.subscribe
  app.server.get   "/api/v1/subscriptions/:sid",  app.bodyParser, app.controllers.api.routes.v1.notifications.get


  app.server.post  "/api/ajax/comments/:slug/add", auth.requiresLogin, app.bodyParser, app.controllers.comments.addComment


  app.server.get "/api/v1/users/\\$.json", (req, res) ->
    if req.user
      return res.jsonp
        username: req.user.username
        bio: req.user.bio
        website: req.user.website
        role: req.user.role
        public_email: req.user.public_email
        company: req.user.company
        location: req.user.location
    res.jsonp({})


  app.server.get "/api/cart/:cart/push/:id", app.controllers.api.addToCart
  app.server.get "/api/cart/create", app.controllers.api.createCart
  app.server.get "/api/cart/:cart", app.controllers.api.lsCart

  app.server.get "/help/(:section)?.md", app.controllers.help.raw
  app.server.get "/help/(:section)?", app.controllers.help.getHelp

  console.log ("  Info - Loading routes took " + (new Date().getTime() - timer + "").bold + " ms").cyan
  return
