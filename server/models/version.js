(function() {
  var Schema, mongoose;

  mongoose = require("mongoose");

  Schema = mongoose.Schema({
    name: String,
    mod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mod"
    },
    files: [
      {
        path: String,
        uid: String
      }
    ],
    slaves: [
      {
        mod: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Mod"
        }
      }
    ]
  });

  Schema.methods = {};

  Schema.statics = {
    createFile: function(uid, path, modId, v, cb) {
      var self;
      self = this;
      if (typeof v === "string") {
        return self.findOne({
          name: v,
          mod: modId
        }, function(err, version) {
          if (err) {
            cb(err);
          }
          console.log(version);
          if (version) {
            version.files.push({
              path: path,
              uid: uid
            });
            return version.save(cb);
          } else {
            return self.create({
              mod: modId,
              name: v,
              files: [
                {
                  path: path,
                  uid: uid
                }
              ]
            }, cb);
          }
        });
      }
    }
  };

  mongoose.model("Version", Schema);

}).call(this);
