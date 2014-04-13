(function() {
  var Mod, mongoose;

  mongoose = require("mongoose");

  Mod = mongoose.model("Mod");

  exports.add = function(req, res) {
    console.log(req.body);
    return Mod.load({
      slug: req.params.slug,
      author: req.user._id
    }, function(err, mod) {
      if (err || !mod) {
        return status("error", 404, "not_found", "Can't found mod");
      }
      return Mod.findOne({
        slug: req.body.dep,
        "versions.name": req.body.version
      }, {
        "versions.$": 1
      }, function(err, dep) {
        if (err || !mod) {
          return status("error", 400, "invalid_params", "Can't found dep!");
        }
        console.log(dep);
        mod.deps.push({
          name: dep.versions[0].name,
          id: dep.versions[0]._id
        });
        mod.save();
        return res.send("success", 200, "done", "Dependency added");
      });
    });
  };

}).call(this);
