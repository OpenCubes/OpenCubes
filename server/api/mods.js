(function() {
  var canThis, mongoose, perms, validator;

  perms = require("./permissions");

  validator = require("validator");

  canThis = perms.canThis;

  mongoose = require("mongoose");

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
        return callback(new Error("unauthorized"));
      }
      if (options.perPage > 50) {
        return callback(new Error("invalid_args"));
      }
      Mod = mongoose.model("Mod");
      Mod.list(options, function(err, mods) {
        if (err) {
          return callback(err);
        }
        return Mod.count().exec(function(err, count) {
          mods.totalCount = count;
          return callback(mods);
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
        return callback(new Error("unauthorized"));
      }
      Mod = mongoose.model("Mod");
      Mod.load({
        slug: slug,
        $cart_id: cart,
        $user: user
      }, function(err, mod) {
        if (err || !mod) {
          return callback(new Error("not_found"));
        }
        if (parse === true) {
          mod.htmlbody = require("../parser")(mod.body);
        }
        return callback(mod);
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
          return callback(new Error("unauthorized"));
        }
        if (err || !mod) {
          return callback(new Error("unauthorized"));
        }
        return mod.fillDeps(function(err, deps) {
          if (err || !deps) {
            return callback(new Error("database_error"));
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
          return callback(new Error("unauthorized"));
        }
        if (err || !mod) {
          if (err) {
            console.log(err);
          }
          return callback(new Error("Please try again"));
        }
        mod[field] = value;
        mod.save();
        return callback("ok");
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
        return callback(new Error("unauthorized"));
      }
      Mod = mongoose.model("Mod");
      mod = new Mod(mod);
      return mod.save(function(err, mod) {
        return callback(err || mod);
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
        return callback(new Error("unauthorized"));
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
            return callback(err || mod);
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
        return callback(new Error("unauthorized"));
      }
      Mod = mongoose.model("Mod");
      regex = new RegExp(query, 'i');
      q = Mod.find({
        name: regex
      });
      q.populate("author", "username");
      return q.exec(function(err, mods) {
        return callback(err || mods);
      });
    });
  }).toPromise(this);

}).call(this);
