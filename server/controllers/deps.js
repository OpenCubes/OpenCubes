(function() {
  var Mod, Version, error, errors, mongoose;

  mongoose = require("mongoose");

  Mod = mongoose.model("Mod");

  Version = mongoose.model("Version");

  errors = error = require("../error");

  exports.add = function(req, res) {
    console.log(req.body);
    return app.api.deps.add(req.getUserId(), req.params.slug, req.body.dep, req.body.version).then(function(version) {
      return res.send("success", 200, "done", "Dependency added");
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "json");
    });
  };

}).call(this);
