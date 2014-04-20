(function() {
  var Cart, ModSchema, Schema, fs, mongoose, slug, timestamps;

  mongoose = require("mongoose");

  Schema = mongoose.Schema;

  Cart = mongoose.model("Cart");

  slug = require("mongoose-slug");

  timestamps = require("mongoose-times");

  fs = require("fs");

  ModSchema = mongoose.Schema({
    name: String,
    version: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    summary: String,
    body: String,
    logo: String,
    dl_id: String,
    creation_date: Date,
    lmodified_date: Date,
    category: String,
    vote_count: Number,
    stargazers: [
      {
        id: Schema.Types.ObjectId,
        date: Date
      }
    ],
    comments: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
        title: String,
        body: String,
        date: Date
      }
    ]
  });

  ModSchema.post('remove', function(doc) {
    console.log('`%s` has been removed', doc.name);
    fs.unlink("../uploads/" + mod.logo, function(err) {
      if (err) {
        return console.log(err);
      } else {
        return console.log("File " + mod.logo + " has been deleted");
      }
    });
    return mongoose.model("Version").find({
      mod: this._id
    }, function(err, versions) {
      var version, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = versions.length; _i < _len; _i++) {
        version = versions[_i];
        if (version) {
          _results.push(version.remove());
        }
      }
      return _results;
    });
  });

  ModSchema.path("name").required(true, "Mod title cannot be blank");

  ModSchema.path("body").required(true, "Mod body cannot be blank");

  ModSchema.path("author").required(true, "Mod author cannot be blank");

  ModSchema.path("summary").required(true, "Mod summary cannot be blank");

  ModSchema.plugin(slug("name"));

  ModSchema.plugin(timestamps);

  fs = require("fs");

  ModSchema.methods = {
    fillDeps: function(cb) {
      var q;
      q = mongoose.model("Version").find({
        "slaves.mod": this._id
      });
      q.populate("mod", "name author");
      return q.exec(cb);
    },
    fillCart: function(cart) {
      var mod, _i, _len, _ref;
      _ref = cart.mods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mod = _ref[_i];
        if (mod.toString() === this._id.toString()) {
          this.carted = true;
        }
      }
    },
    fillStargazer: function(luser) {
      var user, _i, _len, _ref;
      _ref = this.stargazers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        user = _ref[_i];
        if ("" + user.id.toString() === "" + luser._id) {
          this.starred = true;
        }
      }
    },
    addFile: function(uid, path, version, cb) {
      mongoose.model("Version").createFile(uid, path, this, version, cb);
    },
    deleteFile: function(uid, cb) {},
    /*
    Output:
    
    {
    "version1": {
    "path": "uid"
    }...
    }
    */

    listVersion: function(callback, processDeps) {
      var Version, self;
      if (processDeps == null) {
        processDeps = false;
      }
      Version = mongoose.model("Version");
      self = this;
      return Version.find({
        mod: this._id
      }, function(err, versions) {
        var file, output, version, _i, _j, _len, _len1, _ref;
        if (err) {
          return callback(void 0, err);
        }
        if (!versions) {
          return callback();
        }
        output = {};
        for (_i = 0, _len = versions.length; _i < _len; _i++) {
          version = versions[_i];
          output[version.name] = output[version.name] || {};
          _ref = version.files;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            file = _ref[_j];
            output[version.name][file.path] = file.uid;
          }
        }
        if (processDeps) {
          return self.fillDeps(function(err, deps) {
            var dep, _k, _l, _len2, _len3, _ref1;
            for (version in output) {
              for (_k = 0, _len2 = deps.length; _k < _len2; _k++) {
                dep = deps[_k];
                _ref1 = dep.files;
                for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                  file = _ref1[_l];
                  output[version][file.path] = file.uid;
                }
              }
            }
            return callback(output);
          });
        }
        return callback(output);
      });
    }
  };

  ModSchema.statics = {
    /*
    Find article by id
    
    @param {ObjectId} id
    @param {Function} cb
    @api private
    */

    load: function(data, cb) {
      var cartId, lean, query, user;
      cartId = data.$cart_id;
      user = data.$user;
      lean = data.$lean;
      data.$cart_id = data.$user = data.$lean = void 0;
      query = this.findOne(data);
      if (lean) {
        query.lean();
      }
      query.populate("comments.author", "username");
      query.populate("author", "username");
      query.exec(function(err, mod) {
        if (cartId) {
          return Cart.findById(cartId, function(err, cart) {
            if (!err && cart) {
              mod.fillCart(cart);
            }
            if (user) {
              mod.fillStargazer(user);
            }
            return cb(err, mod);
          });
        }
        return cb(err, mod);
      });
    },
    /*
    List articles
    
    @param {Object} options
    @param {Function} cb
    @api private
    */

    list: function(options, cb) {
      var criteria, q;
      criteria = options.criteria || {};
      q = this.find(criteria).sort(options.sort).limit(options.perPage).populate("author", "username").skip(options.perPage * options.page).select("-body -comments");
      if (options.doLean) {
        q.lean();
      }
      q.exec(function(err, mods) {
        if (err || !mods) {
          return cb(err, mods);
        }
        if (options.cart) {
          return Cart.findById(options.cart, function(err, cart) {
            var mod, _i, _len;
            if (!err && cart) {
              for (_i = 0, _len = mods.length; _i < _len; _i++) {
                mod = mods[_i];
                mod.fillCart(cart);
              }
              return cb(err, mods);
            }
          });
        } else {
          return cb(err, mods);
        }
      });
    }
  };

  mongoose.model("Mod", ModSchema);

}).call(this);
