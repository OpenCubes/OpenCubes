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
  userid = "53e88edbedcfe99201772373";
  console.log((" Info - Bootstraping took " + (new Date().getTime() - timer2 +
    "").bold + " ms").cyan);
  Mod = mongoose.model("Mod");
  Star = mongoose.model("Star");

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  var slug = "a-game-of-cubes";
  hit = function(i){
    i++;
    if(i > 500) return;
    app.api.mods.star(userid, slug, Date.now() - getRandomInt(0, 31) * 24 * 3600 * 1000, true).then(function(){
      hit(i);
      console.log(i);
    }).fail(function(star) {
      console.log(star)
    });
  }
  hit(0);
});
