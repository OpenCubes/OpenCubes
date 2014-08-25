mongoose = require("mongoose")
Schema = mongoose.Schema
  user:
    type: mongoose.Schema.Types.ObjectId
    ref: "User"
  mod:
    type: mongoose.Schema.Types.ObjectId
    ref: "Mod"
  rate: Number



mongoose.model "Rating", Schema
