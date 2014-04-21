Mod = require("mongoose").model("Mod")

exports.addComment = (req, res) ->
  app.api.comments.add(req.getUserId(), req.params.slug,
                       req.body.name, req.body.body).then((comment) ->
    return res.send status "success", 200, "Posted!"
  ).fail (err) ->
    console.log err
    return res.send status "error", 500, "database_error", "Error with database. Please try again."

exports.editComment = (req, res) ->

exports.removeComment = (req, res) ->

