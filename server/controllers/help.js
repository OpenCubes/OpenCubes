(function() {
  var fs;

  fs = require("fs");

  exports.getHelp = function(req, res) {
    var file, read, section;
    console.log(req.params.section);
    section = ["markdown"].fetch(req.params.section || "welcome", "welcome");
    file = __dirname.getParent() + "/views/help/" + section + ".md";
    console.log(file);
    fs.readFile(file, read = function(err, data) {
      var html;
      if (err) {
        console.log(err);
      }
      html = req.application.parser(data.toString());
      res.render("help/help.ect", {
        html: html
      });
    });
  };

  exports.raw = function(req, res) {
    var file, read, section;
    console.log(req.params.section);
    section = req.params.section || "welcome";
    file = __dirname.getParent() + "/views/help/" + section + ".md";
    fs.readFile(file, read = function(err, data) {
      var html;
      if (data == null) {
        data = "Page not found";
      }
      if (err) {
        console.log(err);
      }
      html = req.application.parser(data.toString());
      res.send(html);
    });
  };

}).call(this);
