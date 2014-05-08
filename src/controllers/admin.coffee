Mod = require("mongoose").model("Mod")
exports.mods = (req, res) ->
  if req.query.id
    Mod.findOne {slug: req.query.id}, (err, mod) ->
      if err or !mod
        console.log err
        return res.send "error"
      mod.remove()
      res.send "ok"
   else res.render "admin/mod-management.ect"
