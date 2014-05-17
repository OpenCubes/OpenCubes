auth = require("./middlewares/auth.js")
flood = require("./middlewares/flood.js")
module.exports = (app) ->
  timer = new Date().getTime()
  app.server.get "/(page/:page)?", app.controllers.mods.index

  app.server.get "/search", app.controllers.mods.search
  app.server.get "/mods/:id", app.controllers.mods.view

  app.server.get "/assets/:slug.png", app.controllers.mods.getLogo

  app.server.get "/mods/:id/edit/(:section)?", auth.requiresLogin, app.controllers.mods.edit

  app.server.post "/mods/:id/edit/files", auth.requiresLogin, app.controllers.files.upload
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

  app.server.get "/cart/:id", app.controllers.mods.cart
  app.server.get "/signup", app.controllers.users.signup
  app.server.get "/users/:name", app.controllers.users.show
  app.server.post "/signup", app.controllers.users.create
  app.server.post "/upload", auth.requiresLogin, app.controllers.mods.doUpload
  app.server.get "/logout", (req, res) ->
    req.logout()
    res.redirect "/"
    return
  # Admin panel
  app.server.get "/admin/mods", app.controllers.admin.mods

  # API
  app.server.post "/api/ajax/parse.md", app.controllers.api.parseMd
  app.server.get "/api/ajax/login", app.controllers.api.ajaxLogin
  app.server.get "/api/ajax/glyphicons", app.controllers.api.glyphicons
  app.server.post "/api/ajax/comments/:slug/add", auth.requiresLogin, app.bodyParser, app.controllers.comments.addComment

  app.server.get "/api/mods/search/:string", app.controllers.api.search
  app.server.get "/api/mods/view/:id.json", app.controllers.api.view
  app.server.get "/api/mods/list(/perPage:perPage)?/page:page.json", flood(1000, 2, 1000), app.controllers.api.list

  app.server.get "/api/cart/:cart/push/:id", app.controllers.api.addToCart
  app.server.get "/api/cart/create", app.controllers.api.createCart
  app.server.get "/api/cart/:cart", app.controllers.api.lsCart

  app.server.get "/help/(:section)?.md", app.controllers.help.raw
  app.server.get "/help/(:section)?", app.controllers.help.getHelp

  console.log ("  Info - Loading routes took " + (new Date().getTime() - timer + "").bold + " ms").cyan
  return