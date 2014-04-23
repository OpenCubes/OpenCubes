(function() {
  var Mod, Version, mongoose;

  mongoose = require("mongoose");

  Mod = mongoose.model("Mod");

  Version = mongoose.model("Version");

  exports.add = function(req, res) {
    return app.api.deps.add(req.getUserId(), req.params.slug, req.body.dep, req.body.version).then(function(version) {
      return res.send("success", 200, "done", "Dependency added");
    }).fail(function(err) {
      console.log(err);
      return res.send(status("error", 404, "not_found", "Can't found mod or dep"));
    });
  };

}).call(this);
