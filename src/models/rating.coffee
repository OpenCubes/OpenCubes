mongoose = require("mongoose")
Schema = mongoose.Schema
  user:
    type: mongoose.Schema.Types.ObjectId
    ref: "User"
  mod:
    type: mongoose.Schema.Types.ObjectId
    ref: "Mod"
  rate: Number

Schema.post "remove", (rating) ->
  Mod = mongoose.model "Mod"
  Mod.findById rating.mod, (mod) ->
    mod.cached.rating -= rating.rate
    mod.cahed.rating_count--
    mod.save ->
      console.log "Rating for mod \"#{mod.name}\" (value: #{rating.rate}) has been removed" 

mongoose.model "Rating", Schema
