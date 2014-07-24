config = config = require("./lib/config");
mongoose = require("mongoose");
require("colors");
fs = require("fs");
_ = require("lodash");
require("./lib/utils")
mongoose.connect(config.db_uri, config.db_opt, function(err) {
  var api_path, controllers_path, ectRenderer, httpServer, models_path,
    server, timer2;
  if (err) {
    return console.log(" Error - Can't connect to mongodb".red);
  }
  timer2 = new Date().getTime();
  models_path = __dirname + "/lib/models";
  fs.readdirSync(models_path).forEach(function(file) {
    if (~file.indexOf(".js")) {
      return require(models_path + "/" + file);
    }
  });
  app = {
    api: {}
  };
  api_path = __dirname + "/lib/api";
  fs.readdirSync(api_path).forEach(function(file) {
    if (~file.indexOf(".js")) {
      app.api[file.slice(0, -3)] = require(api_path + "/" + file);
    }
  });
  userid = "537377493f6432ac1d89b6c7";
  console.log((" Info - Bootstraping took " + (new Date().getTime() - timer2 +
    "").bold + " ms").cyan);
  Mod = mongoose.model("Mod");
  Star = mongoose.model("Star");

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  var count = 0;

  function update(i) {
    if (i > 10000) return;
    var slug = "floodgate";
    var type = "view",
      id = "53765b47cd95a4f823f51581";
    app.api.stats.get(id, type, Date.now()).then(function(a) {
      console.log(a)
    });
  }
  var i = 0;
  update(0);


});
