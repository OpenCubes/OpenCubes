(function() {
  var Cart, ModSchema, Schema, mongoose, slug, timestamps;

  mongoose = require("mongoose");

  Schema = mongoose.Schema;

  Cart = mongoose.model("Cart");

  slug = require("mongoose-slug");

  timestamps = require("mongoose-times");

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
    ],
    deps: [
      {
        name: String,
        id: Schema.Types.ObjectId
      }
    ],
    versions: [
      {
        name: String
      }
    ]
  });

  ModSchema.path("name").required(true, "Mod title cannot be blank");

  ModSchema.path("body").required(true, "Mod body cannot be blank");

  ModSchema.plugin(slug("name"));

  ModSchema.plugin(timestamps);

  ModSchema.methods = {
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
    addVersion: function(data, cb) {
      var self, v;
      v = this.versions.push(data);
      self = this;
      this.save(function(err, doc) {
        if (err) {
          return cb(err);
        }
        self.getVersion(data, cb);
      });
    },
    getVersion: function(data, cb) {
      var v;
      v = this.versions.findIn(data);
      console.log(v);
      return cb(undefined, v);
    },
    /*
    Create the version by name if it does not exists
    */

    getOrCreateVersion: function(name, cb) {
      var self;
      self = this;
      this.getVersion({
        name: name
      }, function(err, doc) {
        if (!doc || err || doc === -1) {
          return self.addVersion({
            name: name
          }, cb);
        }
        cb(err, doc);
      });
    },
    addFile: function(uid, path, version, cb) {
      mongoose.model("File").createFile(uid, path, this, version, cb);
    },
    deleteFile: function(uid, cb) {
      mongoose.model("File").remove({
        uid: uid
      }, cb);
    },
    /*
    Output:
    
    {
    "version1": {
    "path": "uid"
    }...
    }
    */

    listVersion: function(cb, processDeps) {
      var $deps, $versions, File, res, v, versions, _i, _len, _ref;
      if (processDeps == null) {
        processDeps = false;
      }
      File = mongoose.model("File");
      versions = [];
      _ref = this.versions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        versions.push(v._id);
      }
      console.log("versions:", versions);
      $versions = this.versions;
      $deps = this.deps;
      res = [];
      File.find({
        version: {
          $in: versions
        }
      }, function(err, files) {
        var data, f, file, _j, _k, _l, _len1, _len2, _len3, _len4, _m;
        for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
          file = files[_j];
          res.push(file);
        }
        data = {};
        for (_k = 0, _len2 = res.length; _k < _len2; _k++) {
          f = res[_k];
          for (_l = 0, _len3 = $versions.length; _l < _len3; _l++) {
            v = $versions[_l];
            if (v._id.toString() === f.version.toString()) {
              data[v.name] = data[v.name] || {};
              data[v.name][f.path] = f.uid;
            }
          }
        }
        if (processDeps === true) {
          versions = [];
          console.log("deps:", $deps);
          for (_m = 0, _len4 = $deps.length; _m < _len4; _m++) {
            v = $deps[_m];
            versions.push(v.id);
          }
          console.log("vs:", versions);
          return File.find({
            version: {
              $in: versions
            }
          }, function(err, files) {
            var _len5, _len6, _n, _o;
            console.log("files:", files);
            res = [];
            for (_n = 0, _len5 = files.length; _n < _len5; _n++) {
              file = files[_n];
              res.push(file);
            }
            console.log("res:", res);
            for (_o = 0, _len6 = res.length; _o < _len6; _o++) {
              f = res[_o];
              for (v in data) {
                console.log("vf:", v, f);
                data[v][f.path] = f.uid;
              }
            }
            console.log(data);
            return cb(data);
          });
        }
        console.log(data);
        return cb(data);
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
      var cartId, query, user;
      cartId = data.$cart_id;
      user = data.$user;
      data.$cart_id = void 0;
      data.$user = void 0;
      query = this.findOne(data);
      query.populate("comments.author");
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
      var criteria;
      criteria = options.criteria || {};
      this.find(criteria).sort(options.sort).limit(options.perPage).populate("author", "username").skip(options.perPage * options.page).exec(function(err, mods) {
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
