mongoose = require("mongoose")
Mod = mongoose.model("Mod")
Version = mongoose.model("Version")
exports.add = (req, res) ->
  app.api.deps.add(req.getUserId(), req.params.slug, req.body.dep, req.body.version)
  .then((version) ->
    return res.send "success", 200, "done", "Dependency added"
  ).fail (err) ->
    console.log err
    return res.send(status "error", 404, "not_found", "Can't found mod or dep")
