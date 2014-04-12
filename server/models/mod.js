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

    listVersion: function(cb) {
      var File, list;
      File = mongoose.model("File");
      list = function(versions, i, data) {
        if (i === versions.length) {
          return cb(data);
        }
        File.find({
          version: versions[i]._id
        }).sort("path").exec(function(err, doc) {
          var files, verName;
          if (err) {
            return console.log(err);
          }
          verName = versions[i].name;
          files = {};
          doc.forEach(function(file) {
            files[file.path] = file.uid;
          });
          data[verName] = files;
          i++;
          list(versions, i, data);
        });
      };
      list(this.versions, 0, {});
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
