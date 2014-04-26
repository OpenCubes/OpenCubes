Mod = require("mongoose").model("Mod")

exports.addComment = (req, res) ->
  app.api.comments.add(req.getUserId(), req.params.slug,
                       req.body.name, req.body.body).then((comment) ->
    return res.send status "success", 200, "Posted!"
  ).fail (err) ->
    errors.handleHttp err, req, res, "json"

exports.editComment = (req, res) ->

exports.removeComment = (req, res) ->

