(function() {
  exports.requiresLogin = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    if (req.accepts("html") && !req.xhr) {
      return res.redirect("/login?target=" + req.url);
    } else if (req.accepts("json")) {
      return res.send(401, {
        error: "unauthenticated"
      });
    }
    return res.send(401, "please login");
  };

}).call(this);
