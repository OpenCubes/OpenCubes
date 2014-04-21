(function() {
  var Mod;

  Mod = require("mongoose").model("Mod");

  exports.addComment = function(req, res) {
    return app.api.comments.add(req.getUserId(), req.params.slug, req.body.name, req.body.body).then(function(comment) {
      return res.send(status("success", 200, "Posted!"));
    }).fail(function(err) {
      console.log(err);
      return res.send(status("error", 500, "database_error", "Error with database. Please try again."));
    });
  };

  exports.editComment = function(req, res) {};

  exports.removeComment = function(req, res) {};

}).call(this);
