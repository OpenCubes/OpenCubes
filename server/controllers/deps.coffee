mongoose = require("mongoose")
Mod = mongoose.model("Mod")

exports.add = (req, res) ->
  console.log(req.body)
  Mod.load {slug: req.params.slug, author: req.user._id}, (err, mod) ->
    if(err or !mod)
      return status "error", 404, "not_found", "Can't found mod"
    Mod.findOne {slug: req.body.dep, "versions.name": req.body.version}, {"versions.$":1}, (err, dep) ->
      if(err or !mod)
        return status "error", 400, "invalid_params", "Can't found dep!"
      console.log(dep)
      mod.deps.push
        name: dep.versions[0].name
        id: dep.versions[0]._id
      mod.save()
      return res.send "success", 200, "done", "Dependency added"
