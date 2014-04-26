(function() {
  var Mod;

  Mod = require("mongoose").model("Mod");

  exports.addComment = function(req, res) {
    return app.api.comments.add(req.getUserId(), req.params.slug, req.body.name, req.body.body).then(function(comment) {
      return res.send(status("success", 200, "Posted!"));
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "json");
    });
  };

  exports.editComment = function(req, res) {};

  exports.removeComment = function(req, res) {};

}).call(this);
