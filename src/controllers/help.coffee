fs = require("fs")
exports.getHelp = (req, res) ->
  section = ["markdown"].fetch(req.params.section or "welcome", "welcome")
  file = __dirname.getParent() + "/views/help/" + section + ".md"
  console.log file
  fs.readFile file, read = (err, data) ->
    console.log err  if err
    html = req.application.parser(data.toString())
    res.render "help/help.ect",
      html: html

    return

  return

exports.raw = (req, res) ->
  section = (req.params.section or "welcome")
  file = __dirname.getParent() + "/views/help/" + section + ".md"

  fs.readFile file, read = (err, data="Page not found") ->
    console.log err  if err
    html = req.application.parser(data.toString())
    res.send html
    return

  return
