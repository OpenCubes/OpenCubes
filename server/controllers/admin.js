(function() {
  var Mod;

  Mod = require("mongoose").model("Mod");

  exports.mods = function(req, res) {
    if (req.query.id) {
      return Mod.findOne({
        slug: req.query.id
      }, function(err, mod) {
        if (err || !mod) {
          console.log(err);
          return res.send("error");
        }
        mod.remove();
        return res.send("ok");
      });
    } else {
      return res.render("admin/mod-management.ect");
    }
  };

}).call(this);
