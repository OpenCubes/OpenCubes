symbols = require("markdown-symbols")
marked = require("marked")
marked.setOptions
  renderer: new marked.Renderer()
  gfm: true
  tables: true
  breaks: false
  pedantic: false
  sanitize: true
  smartLists: true
  smartypants: false
  langPrefix: "language-"

module.exports = (md) ->
  html = marked(md)

  # We end with symbols b/c otherwise
  # the tags created by symbols would be deleted by marked
  symbols.process html
