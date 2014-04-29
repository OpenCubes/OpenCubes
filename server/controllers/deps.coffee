mongoose = require("mongoose")
Mod = mongoose.model("Mod")
Version = mongoose.model("Version")
errors = error = require "../error"
exports.add = (req, res) ->
  console.log req.body
  app.api.deps.add(req.getUserId(), req.params.slug, req.body.dep, req.body.version)
  .then((version) ->
    return res.send "success", 200, "done", "Dependency added"
  ).fail (err) ->
    errors.handleHttp err, req, res, "json"
