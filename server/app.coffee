app =
  controllers: {}
  models: {}
  init: (cb) ->
    require "./utils"
    timer = new Date().getTime()
    express = require("express")
    http = require("http")
    path = require("path")
    router = require("./router")
    config = require("./config")
    fs = require("fs")
    ECT = require("ect")
    lessMiddleware = require("less-middleware")
    utils = require("./controllers/utils.js")
    flash = require("express-flash")
    passport = require("passport")
    app.parser = require("./parser.js")
    require "colors"
    console.log ("  Info - Trying to run server at " + config.ip.bold + " throught " + config.port.bold).yellow
    console.log ("  Info - Loading dependencies took " + (new Date().getTime() - timer + "").bold + " ms").cyan
    mongoose = require("mongoose")
    mongoose.connect config.db_uri, config.db_opt, (err) ->
      return console.log(("  Error - Can't connect to mongodb").red)  if err
      ###
      if config.env is "dev"
        edt = require('express-debug')
        edt(app, {
          panels: ['locals', 'request', 'session', 'template', 'software_info', 'profile']
          depth: 4
          extra_panels: []
          path: '/express-debug'
        })
        
      ###
      
      timer2 = new Date().getTime()
      
      # Bootstrap models
      models_path = __dirname + "/models"
      fs.readdirSync(models_path).forEach (file) ->
        require models_path + "/" + file  if ~file.indexOf(".js")
        return

      
      # Bootstrap models
      controllers_path = __dirname + "/controllers"
      fs.readdirSync(controllers_path).forEach (file) ->
        
        #  console.log(file.slice(0,-3));
        app.controllers[file.slice(0, -3)] = require(controllers_path + "/" + file)  if ~file.indexOf(".js")
        return

      console.log ("  Info - Bootstraping took " + (new Date().getTime() - timer2 + "").bold + " ms").cyan
      server = undefined
      app.server = server = express()
      server.set "port", config.port
      server.set "ip", config.ip
      server.set "views", path.join(__dirname, "views")
      server.set "view engine", "html"
      server.use express.favicon()
      server.use express.logger("dev")
      server.use express.json()
      server.use express.urlencoded()
      server.use express.methodOverride()
      server.use express.cookieParser(config.securitySalt)
      server.use express.session()
      server.use flash()
      require("./passport") passport, config
      
      # use passport session
      server.use passport.initialize()
      server.use passport.session()
      server.use (req, res, next) ->
        res.locals.user = req.user
        res.locals.theme = config.theme
        res.locals.parse = app.parser
        req.application = app
        next()
        return

      app.passport = passport
      ectRenderer = ECT(
        watch: true
        root: __dirname + "/views"
      )
      server.engine ".ect", ectRenderer.render
      server.use lessMiddleware(
        src: __dirname + "/less"
        dest: __dirname.getParent() + "/public/css"
        
        # if you're using a different src/dest directory, you
        # MUST include the prefex, which matches the dest
        # public directory
        prefix: "/css"
        
        # force true recompiles on every request... not the
        # best for production, but fine in debug while working
        # through changes
        force: config.env is "dev"
      )
      server.use express.static(path.join(__dirname.getParent(), "public"))
      server.use uploadDir: __dirname.getParent() + "/temp"
      server.use server.router
      server.use utils.notfound
      
      # development only
      server.use express.errorHandler()  if "development" is server.get("env")
      router app
      httpServer = http.createServer(server)
      httpServer.listen server.get("port"), server.get("ip"), ->
        console.log ("  Info - Express server listening on port " + (httpServer.address().port + "").bold + " in " + (new Date().getTime() - timer + "").bold + " ms").green
        cb()
        return

      return

    return

module.exports = app
