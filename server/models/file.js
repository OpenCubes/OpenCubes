(function() {
  var FileSchema, Schema, mongoose;

  mongoose = require("mongoose");

  Schema = mongoose.Schema;

  FileSchema = mongoose.Schema({
    uid: String,
    path: String,
    version: Schema.Types.ObjectId
  });

  FileSchema.methods = {};

  FileSchema.statics = {
    createFile: function(uid, path, mod, version, cb) {
      var func, self;
      self = this;
      func = function(v) {
        var file;
        file = new self({
          uid: uid,
          version: v._id,
          path: path
        });
        file.save(cb);
      };
      if (typeof version === "string") {
        return mod.getOrCreateVersion(version, function(err, doc) {
          if (err) {
            return cb(err);
          }
          if (!doc) {
            return cb();
          }
          console.log("doc:", doc);
          func(doc);
        });
      }
      func(version);
    }
  };

  mongoose.model("File", FileSchema);

}).call(this);
