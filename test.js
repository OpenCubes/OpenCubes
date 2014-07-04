config = config = require("./lib/config");
mongoose = require("mongoose");
require("colors");
fs = require("fs");
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
  Star = mongoose.model("Star");/*
  var slug = "spawner-gui";
  app.api.mods.star(userid, slug, Date.now() - 31 * 24 * 3600 * 1000, true).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 5 * 31 * 24 * 3600 * 1000, true)
  }).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 12 * 31 * 24 * 3600 * 1000, true)
  }).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 5 * 24 * 3600 * 1000, true)
  }).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 2 * 3600 * 1000, true)
  }).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 600 * 1000, true)
  }).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 611 * 1000, true)
  }).then(function(star) {
    console.log(star)
    return app.api.mods.star(userid, slug, Date.now() - 596 * 1000, true)
  }).fail(function(star) {
    console.log(star)
  });*/
  var id = "537654d1b040920c1a2a19d4";
  Star.count({
    mod: id,
    "time_bucket.year": "2014"
  }, function(err, doc) {
    console.log(err || doc);

  });
  Star.aggregate({
    $match: {
      "time_bucket.year": "2014"
    }
  },{
    $group: {
      _id: "$mod",
      stars: {
        "$sum": 1
      }
    }
  }, function(err, docs) {
     Star.populate(docs, {
            path: "_id",
            model: "Mod",
            select: "slug name description"
        }, function (err, doc) {

            console.log(err || doc);
        });
  })

});
