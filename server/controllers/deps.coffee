mongoose = require("mongoose")
Mod = mongoose.model("Mod")
Version = mongoose.model("Version")
exports.add = (req, res) ->
  console.log(req.body)
  Mod.load {slug: req.params.slug, author: req.user._id}, (err, mod) ->
    if(err or !mod)
      return status "error", 404, "not_found", "Can't found mod"
    Mod.findOne {slug: req.body.dep}, (err, dep) ->
      if(err or !dep)
        return status "error", 400, "invalid_params", "Can't found dep!"
      console.log "dep:", dep
      Version.findOne {mod: dep._id, name: req.body.version}, (err, version)->
        version.slaves.push
          mod: mod._id
        version.save()
        return res.send "success", 200, "done", "Dependency added"
