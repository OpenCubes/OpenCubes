(function() {
  var URI;

  exports.notfound = function(req, res, next) {
    res.status(404);
    if (req.accepts("html")) {
      res.render("utils/404.ect", {
        url: req.url,
        title: "404 Not found",
        reason: res.reason || "Unknown"
      });
      return;
    }
    if (req.accepts("json")) {
      res.send({
        error: "Not found"
      });
      return;
    }
    res.type("txt").send("Not found");
  };

  URI = require("URIjs");

  exports.ectHelpers = function(req, data) {
    data.urlHelper = function(key, value) {
      return (new URI(req.url)).setQuery(key, value);
    };
    data.isQueried = function(key, value) {
      return (new URI(req.url)).hasQuery(key, value);
    };
    return data;
  };

}).call(this);
