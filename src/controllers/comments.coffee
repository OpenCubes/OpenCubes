Mod = require("mongoose").model("Mod")
errors = require "../error"

exports.addComment = (req, res) ->
  app.api.comments.add(req.getUserId(), req.params.slug,
                       req.body.name, req.body.body).then((comment) ->
    return res.send status "success", 200, "Posted!"
  ).fail (err) ->
    console.log err
    errors.handleHttp err, req, res, "json"

exports.editComment = (req, res) ->

exports.removeComment = (req, res) ->

