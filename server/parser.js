(function() {
  var marked, symbols;

  symbols = require("markdown-symbols");

  marked = require("marked");

  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: "language-"
  });

  module.exports = function(md) {
    var html;
    html = marked(md);
    return symbols.process(html);
  };

}).call(this);
