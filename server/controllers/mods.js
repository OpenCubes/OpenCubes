(function() {
  var Cart, Mod, URI, archiver, check, fs, mongoose, paginator, send, url, utils, uuid;

  mongoose = require("mongoose");

  Mod = mongoose.model("Mod");

  utils = require("./utils");

  paginator = require("../paginator.js");

  url = require("url");

  URI = require("URIjs");

  check = require("check-types");

  archiver = require("archiver");

  send = require("send");

  exports.view = function(req, res) {
    setTimeout((function() {
      Mod.load({
        slug: req.params.id,
        $cart_id: req.cookies.cart_id,
        $user: req.user
      }, function(err, mod) {
        if (err || !mod) {
          res.reason = "Mod not found";
          return utils.notfound(req, res, function() {});
        }
        mod.htmlbody = req.application.parser(mod.body);
        return res.render((req.query.ajax ? "../views/mods/view-body.ect" : "view.ect"), {
          mod: mod,
          canEdit: (req.user ? mod.author === req.user.id || req.user.role === "admin" ? true : void 0 : false),
          title: mod.name + " - OpenCubes"
        }, (req.query.ajax ? function(err, html) {
          var result;
          result = {};
          result.body = html;
          res.send(result);
        } : void 0));
      });
      return;
    }), 0);
  };

  exports.edit = function(req, res) {
    return Mod.load({
      slug: req.params.id,
      author: req.user._id
    }, function(err, mod) {
      if (err || !mod) {
        return res.send(403, "You are not the author");
      }
      mod.fillDeps(function(err, deps) {
        var section;
        if (err) {
          console.log(err);
        }
        section = ["general", "description", "files", "dependencies"].fetch(req.params.section, "general");
        mod.listVersion(function(v) {
          console.log(v);
          res.render("edit/" + section + ".ect", {
            mod: mod,
            deps: deps,
            title: "Editing " + mod.name,
            url: "/mod/" + mod.slug + "/edit",
            versions: v
          });
        });
      });
    });
  };

  exports.doEdit = function(req, res) {
    var args;
    args = req.body;
    return Mod.findOne({
      slug: req.params.id,
      author: req.user._id
    }, function(err, mod) {
      if (err || !mod) {
        if (err) {
          console.log(err);
        }
        return res.send(403, "Please try again");
      }
      if (args.value && args.value !== '' && args.name && args.name !== '') {
        mod[args.name] = args.value;
        mod.save();
        return res.send(200, "Done!");
      }
      return res.send(401, "Please fill the field");
    });
  };

  exports.getLogo = function(req, res) {
    if (!req.params.slug) {
      return res.send(403, "no slug");
    }
    return Mod.findOne({
      slug: req.params.slug
    }, function(err, mod) {
      if (err || !mod) {
        return res.send(500, "error");
      }
      if (!mod.logo) {
        return send(req, __dirname.getParent().getParent() + "/public/images/puzzle.png").pipe(res);
      }
      return send(req, __dirname.getParent() + "/uploads/" + mod.logo).pipe(res);
    });
  };

  uuid = require("node-uuid");

  fs = require("fs");

  exports.setLogo = function(req, res) {
    var file, newfile, uid;
    console.log(req.files);
    file = req.files.file;
    if (!file) {
      res.send(401, "missing file");
    }
    uid = uuid.v4() + ".png";
    newfile = __dirname.getParent() + "/uploads/" + uid;
    return fs.rename(file.path, newfile, function(err) {
      var slug;
      if (err) {
        console.log(err);
        return res.send(500, "something went wrong while moving");
      }
      slug = req.params.id;
      return Mod.load({
        slug: slug
      }, function(err, mod) {
        if (err || !mod) {
          console.log(err);
          return res.send(500, "error with db");
        }
        mod.logo = uid;
        console.log("done!");
        mod.save();
        return res.send(200, "done");
      });
    });
  };

  exports.index = function(req, res) {
    var cart, filter, listing, options, page, perPage, query, sort, url_parts;
    page = (req.params.page > 0 ? req.param("page") : 1) - 1;
    sort = (req.param("sort")) || "date";
    filter = (req.param("filter")) || "all";
    perPage = 10;
    options = {
      perPage: perPage,
      page: page,
      sort: sort,
      filter: filter,
      criteria: (filter !== "all" ? {
        category: filter
      } : {}),
      cart: req.cookies.cart_id
    };
    cart = req.cookies.cart_id;
    url_parts = url.parse(req.url, true);
    query = url_parts.search;
    listing = new Date().getTime();
    Mod.list(options, function(err, mods) {
      if (err) {
        return res.render("500");
      }
      Mod.count().exec(function(err, count) {
        console.log(("  Loading mods took " + (new Date().getTime() - listing + " ms")).cyan);
        res.render("../views/index.ect", utils.ectHelpers(req, {
          title: "Mods - OpenCubes",
          mods: mods,
          page: page + 1,
          pages: Math.ceil(count / perPage),
          pagination: paginator.create("search", {
            prelink: "",
            current: page + 1,
            rowsPerPage: perPage,
            totalResult: count,
            postlink: query
          }).render()
        }));
      });
    });
  };

  exports.star = function(req, res) {
    var slug;
    slug = req.params.slug;
    if (!slug || slug === "") {
      return res.send(400, "Missing slug");
    }
    if (!req.user) {
      return res.send(401, "You are not logged in");
    }
    Mod.load({
      slug: slug,
      "stargazers.id": req.user.id
    }, function(err, doc) {
      if (err) {
        return res.send(500, "Unknown error on database...");
      }
      if (doc) {
        doc.vote_count--;
        doc.stargazers[0].remove();
        doc.save();
        res.redirect("/mod/" + slug);
      } else {
        Mod.load({
          slug: slug
        }, function(err, doc) {
          if (err) {
            return res.send(500, "Unknown error on database...");
          }
          doc.stargazers.push({
            id: req.user._id,
            date: Date.now()
          });
          doc.vote_count = (doc.vote_count || 0) + 1;
          doc.save();
          return res.redirect("/mod/" + slug);
        });
      }
    });
  };

  exports.upload = function(req, res) {
    res.render("../views/upload.ect");
  };

  exports.doUpload = function(req, res) {
    var mod;
    mod = new Mod({
      name: req.body.name,
      summary: req.body.summary,
      body: req.body.description,
      author: req.user._id,
      category: req.body.category || "misc"
    });
    mod.save(function(err, doc) {
      console.log(doc);
      if (err) {
        res.render("../views/upload.ect", {
          hasError: true
        });
      } else {
        res.redirect("/");
      }
    });
  };

  Cart = mongoose.model("Cart");

  exports.cart = function(req, res) {
    if (!req.params.id) {
      res.reason = "Missing id";
      return utils.notfound(req, res, function() {});
    }
    return Cart.findById(req.params.id).populate("mods").exec(function(err, cart) {
      if (err || !cart) {
        res.reason = "DB Problem";
        return utils.notfound(req, res, function() {});
      }
      return res.render("users/cart.ect", {
        cart: cart
      });
    });
  };

  exports.search = function(req, res) {
    res.render("mods/search.ect");
  };

}).call(this);
