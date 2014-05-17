config = config = require("./lib/config");
mongoose = require("mongoose");
require("colors");
fs = require("fs");
require("./lib/utils")
mongoose.connect(config.db_uri, config.db_opt, function (err) {
    var api_path, controllers_path, ectRenderer, httpServer, models_path, server, timer2;
    if (err) {
        return console.log("  Error - Can't connect to mongodb".red);
    }
    timer2 = new Date().getTime();
    models_path = __dirname + "/lib/models";
    fs.readdirSync(models_path).forEach(function (file) {
        if (~file.indexOf(".js")) {
            return require(models_path + "/" + file);
        }
    });
    console.log(("  Info - Bootstraping took " + (new Date().getTime() - timer2 + "").bold + " ms").cyan);
    Mod = mongoose.model("Mod");
    User = mongoose.model("User");
    Mod.aggregate([{
        $group: {
            _id: "$author",
            num_mods: {
                $sum: 1
            }
        }
    }], function (err, doc) {
            console.log(err || doc);
        User.populate(doc, {
            path: "_id",
            model: "User",
            select: "username"
        }, function (err, doc) {

            console.log(err || doc);
        });
    })
});