exports.ajaxLogin = (req, res) ->
  res.render "forms/login.ect"
  return

exports.glyphicons = (req, res) ->
  data = require("../../public/api/glyphicons.json")
  console.log data
  res.render "utils/glyphicons.ect",
    list: data

  return

exports.parseMd = (req, res) ->
  return res.send(req.application.parser(req.body.markdown or ""))
  s
  return
