(function() {
  var CartSchema, Schema, mongoose;

  mongoose = require("mongoose");

  Schema = mongoose.Schema;

  CartSchema = mongoose.Schema({
    mods: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Mod'
      }
    ]
  });

  CartSchema.methods = {};

  CartSchema.statics = {};

  mongoose.model("Cart", CartSchema);

}).call(this);
