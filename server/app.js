(function() {
  var app;

  app = {
    controllers: {},
    models: {},
    api: {},
    init: function(cb) {
      var ECT, config, express, flash, fs, http, lessMiddleware, mongoose, passport, path, router, timer, utils;
      require("./utils");
      timer = new Date().getTime();
      express = require("express");
      http = require("http");
      path = require("path");
      router = require("./router");
      app.config = config = require("./config");
      fs = require("fs");
      ECT = require("ect");
      lessMiddleware = require("less-middleware");
      utils = require("./controllers/utils.js");
      flash = require("express-flash");
      passport = require("passport");
      app.parser = require("./parser.js");
      mongoose = require("mongoose");
      require("colors");
      console.log(("  Info - Trying to run server at " + config.ip.bold + " throught " + config.port.bold).yellow);
      console.log(("  Info - Loading dependencies took " + (new Date().getTime() - timer + "").bold + " ms").cyan);
      mongoose.connect(config.db_uri, config.db_opt, function(err) {
        var api_path, controllers_path, ectRenderer, httpServer, models_path, server, timer2;
        if (err) {
          return console.log("  Error - Can't connect to mongodb".red);
        }
        timer2 = new Date().getTime();
        models_path = __dirname + "/models";
        fs.readdirSync(models_path).forEach(function(file) {
          if (~file.indexOf(".js")) {
            return require(models_path + "/" + file);
          }
        });
        controllers_path = __dirname + "/controllers";
        fs.readdirSync(controllers_path).forEach(function(file) {
          if (~file.indexOf(".js")) {
            app.controllers[file.slice(0, -3)] = require(controllers_path + "/" + file);
          }
        });
        api_path = __dirname + "/api";
        fs.readdirSync(api_path).forEach(function(file) {
          if (~file.indexOf(".js")) {
            app.api[file.slice(0, -3)] = require(api_path + "/" + file);
          }
        });
        console.log(("  Info - Bootstraping took " + (new Date().getTime() - timer2 + "").bold + " ms").cyan);
        server = void 0;
        app.server = server = express();
        server.set("port", config.port);
        server.set("ip", config.ip);
        server.set("views", path.join(__dirname, "views"));
        server.set("view engine", "html");
        server.use(express.favicon());
        server.use(express.logger("dev"));
        server.use(express.json());
        server.use(express.urlencoded());
        server.use(express.methodOverride());
        server.use(express.cookieParser(config.securitySalt));
        server.use(express.session());
        server.use(flash());
        require("./passport")(passport, config);
        server.use(passport.initialize());
        server.use(passport.session());
        server.use(function(req, res, next) {
          res.locals.user = req.user;
          res.locals.theme = config.theme;
          res.locals.parse = app.parser;
          req.application = app;
          req.getUserId = function() {
            if (req.user) {
              return req.user._id;
            }
            return "";
          };
          next();
        });
        app.passport = passport;
        ectRenderer = ECT({
          watch: true,
          root: __dirname + "/views"
        });
        server.engine(".ect", ectRenderer.render);
        server.use(lessMiddleware({
          src: __dirname + "/less",
          dest: __dirname.getParent() + "/public/css",
          prefix: "/css",
          force: config.env === "dev"
        }));
        server.use(express["static"](path.join(__dirname.getParent(), "public")));
        server.use({
          uploadDir: __dirname.getParent() + "/temp"
        });
        server.use(server.router);
        server.use(utils.notfound);
        if ("development" === server.get("env")) {
          server.use(express.errorHandler());
        }
        app.bodyParser = express.bodyParser({
          keepExtensions: true,
          uploadDir: path.join(__dirname, '/temp/')
        });
        router(app);
        httpServer = http.createServer(server);
        httpServer.listen(server.get("port"), server.get("ip"), function() {
          console.log(("  Info - Express server listening on port " + (httpServer.address().port + "").bold + " in " + (new Date().getTime() - timer + "").bold + " ms").green);
          return cb();
        });
      });
    }
  };

  module.exports = app;

  global.app = app;

}).call(this);
