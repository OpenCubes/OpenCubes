(function() {
  var canThis, error, errors, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

  errors = error = require("../error");

  /*
  Lists the mods and pass them to the then with a `totalCount` property that counts the mods
  @param userid the current logged user
  @param options the options
  @permission mod:browse
  */


  exports.list = (function(userid, options, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod;
      if (can === false) {
        callback(error.throwError("Forbidden", "UNAUTHORIZED"));
      }
      if (options.perPage > 50) {
        callback(error.throwError("Too much mods per page", "INVALID_PARAMS"));
      }
      Mod = mongoose.model("Mod");
      Mod.list(options, function(err, mods) {
        if (err) {
          return callback(error.throwError(err, "DATABASE_ERROR"));
        }
        return Mod.count().exec(function(err, count) {
          mods.totalCount = count;
          return errors.handleResult(err, mods, callback);
        });
      });
    });
  }).toPromise(this);

  /*
  Return a mod
  @param userid the current logged user id or ""
  @param slug the slug of the mod
  @param cart the current cart id or null
  @param user the current user for edition ({})
  @permission mod:browse
  */


  exports.view = (function(userid, slug, cart, user, parse, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod;
      if (can === false) {
        callback(error.throwError("Forbidden", "UNAUTHORIZED"));
      }
      Mod = mongoose.model("Mod");
      Mod.load({
        slug: slug,
        $cart_id: cart,
        $user: user,
        $populate: true
      }, function(err, mod) {
        var Version;
        if (!mod) {
          return callback(error.throwError("Not found", "NOT_FOUND"));
        }
        if (err) {
          return callback(error.throwError(err, "INVALID_PARAMS"));
        }
        mod = mod.toObject();
        if (parse === true) {
          mod.htmlbody = require("../parser")(mod.body);
        }
        Version = mongoose.model("Version");
        return Version.find({
          mod: mod._id
        }, function(err, versions) {
          var file, output, version, _i, _j, _len, _len1, _ref;
          if (err || !mod) {
            return handleResult(err, mod, callback);
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
          mod.versions = output;
          return callback(mod);
        });
      });
      return;
    });
  }).toPromise(this);

  /*
  Return a mod fully loaded with deps and versions
  @param userid the current logged user id or ""
  @param slug the slug of the mod
  @permission mod:edit
  */


  exports.load = (function(userid, slug, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod;
      Mod = mongoose.model("Mod");
      return Mod.load({
        slug: slug
      }, function(err, mod) {
        if (can === false && mod.author !== userid) {
          callback(error.throwError("Forbidden", "UNAUTHORIZED"));
        }
        if (err || !mod) {
          return handleResult(err, mod, callback);
        }
        return mod.fillDeps(function(err, deps) {
          if (err || !deps) {
            handleResult;
          }
          return mod.listVersion(function(v) {
            var container;
            container = {
              mod: mod,
              deps: deps,
              versions: v
            };
            return callback(container);
          });
        });
      });
    });
  }).toPromise(this);

  /*
  Edit a mod
  @param userid the current logged user id 
  @param slug the slug of the mod
  @param field the field to be edited
  @param value the new value
  @permission mod:edit
  */


  exports.edit = (function(userid, slug, field, value, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod;
      Mod = mongoose.model("Mod");
      return Mod.findOne({
        slug: slug
      }, function(err, mod) {
        if (can === false && mod.author !== userid) {
          callback(error.throwError("Forbidden", "UNAUTHORIZED"));
        }
        if (err || !mod) {
          return handleResult(err, mod, callback);
        }
        mod[field] = value;
        return mod.save(function(err, mod) {
          return errors.handleResult(err, mod, callback);
        });
      });
    });
  }).toPromise(this);

  /*
  Upload a mod
  @param userid the current logged user id 
  @param mod the data of the new mod
  @permission mod:add
  */


  exports.add = (function(userid, mod, callback) {
    return canThis(userid, "mod", "add").then(function(can) {
      var Mod;
      if (can === false) {
        callback(error.throwError("Forbidden", "UNAUTHORIZED"));
      }
      Mod = mongoose.model("Mod");
      mod = new Mod(mod);
      return mod.save(function(err, mod) {
        return errors.handleResult(err, mod, callback);
      });
    });
  }).toPromise(this);

  /*
  Star a mod
  @param userid the current logged user id
  @param mod the data of the mod
  @permission mod:star
  */


  exports.star = (function(userid, slug, callback) {
    return canThis(userid, "mod", "star").then(function(can) {
      var Mod, q;
      if (can === false) {
        callback(error.throwError("Forbidden", "UNAUTHORIZED"));
      }
      Mod = mongoose.model("Mod");
      q = Mod.findOne({
        slug: slug,
        "stargazers.id": userid
      }, {
        "stargazers.$": 1
      });
      return q.exec(function(err, mod) {
        if (err) {
          return callback(err);
        }
        return Mod.findOne({
          slug: slug
        }, function(err, doc) {
          if (err) {
            return callback(err);
          }
          if (!mod) {
            doc.stargazers.push({
              id: userid,
              date: Date.now()
            });
            doc.vote_count = (doc.vote_count || 0) + 1;
          } else {
            doc.vote_count--;
            doc.stargazers.id(mod.stargazers[0]._id).remove();
          }
          return doc.save(function(err, mod) {
            return errors.handleResult(err, mod, callback);
          });
        });
      });
    });
  }).toPromise(this);

  /*
  Search a mod
  @param userid the current logged user id
  @param query the query string
  @permission mod:browse
  */


  exports.search = (function(userid, query, callback) {
    return canThis(userid, "mod", "browse").then(function(can) {
      var Mod, q, regex;
      if (can === false) {
        callback(error.throwError("Forbidden", "UNAUTHORIZED"));
      }
      Mod = mongoose.model("Mod");
      regex = new RegExp(query, 'i');
      q = Mod.find({
        name: regex
      });
      q.populate("author", "username");
      return q.exec(function(err, mods) {
        return errors.handleResult(err, mods, callback);
      });
    });
  }).toPromise(this);

  /*
  Add a file to a mod
  @param userid the current logged user id
  @param slug the slug of the mod
  @param uid the uid (name) of the files loacted in uploads
  @param path the target path
  @param versionName the version of the mod
  @permission mod:edit
  */


  exports.addFile = (function(userid, slug, uid, path, versionName, callback) {
    return canThis(userid, "mod", "edit").then(function(can) {
      var Mod;
      Mod = mongoose.model("Mod");
      return Mod.load({
        slug: slug
      }, function(err, mod) {
        if (can === false && mod.author.equals(userid) !== true) {
          callback(error.throwError("Forbidden", "UNAUTHORIZED"));
        }
        if (err || !mod) {
          callback(err);
        }
        return mod.addFile(uid, path, versionName, function(err, doc) {
          return errors.handleResult(err, doc, callback);
        });
      });
    });
  }).toPromise(this);

}).call(this);
