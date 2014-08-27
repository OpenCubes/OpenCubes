
marked = require("marked")
marked.setOptions
  renderer: new marked.Renderer()
  gfm: true
  tables: true
  breaks: true
  pedantic: false
  sanitize: true
  smartLists: true
  smartypants: true
  langPrefix: "language-"

module.exports = (md) ->
  marked md
