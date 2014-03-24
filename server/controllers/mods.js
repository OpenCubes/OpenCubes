(function() {
  var Cart, Mod, URI, archiver, check, mongoose, paginator, url, utils;

  mongoose = require("mongoose");

  Mod = mongoose.model("Mod");

  utils = require("./utils");

  paginator = require("../paginator.js");

  url = require("url");

  URI = require("URIjs");

  check = require("check-types");

  archiver = require("archiver");

  exports.view = function(req, res) {
    setTimeout((function() {
      Mod.load({
        slug: req.params.id
      }, function(err, mod) {
        if (err || !mod) {
          res.reason = "Mod not found";
          return utils.notfound(req, res, function() {});
        }
        mod.htmlbody = req.application.parser(mod.body);
        return res.render((req.query.ajax ? "../views/mods/view-body.ect" : "view.ect"), {
          mod: mod,
          canEdit: (req.user ? mod.author.equals(req.user.id) : false),
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
    Mod.load({
      slug: req.params.id,
      author: req.user._id
    }, function(err, mod) {
      var section;
      if (err || !mod) {
        return res.send(403, "You are not the author");
      }
      section = ["general", "description", "files"].fetch(req.params.section, "general");
      mod.listVersion(function(v) {
        console.log(v);
        res.render("../views/edit/" + section + ".ect", {
          mod: mod,
          title: "Editing " + mod.name,
          url: "/mod/" + mod.slug + "/edit",
          versions: v
        });
      });
    });
  };

  exports.doEdit = function(req, res) {
    console.log(req.body);
    Mod.load({
      slug: req.params.id,
      author: req.user._id
    }, function(err, mod) {
      var data, map, section;
      if (err || !mod) {
        return res.send(403, "You are not the author");
      }
      data = req.body;
      console.log(req.params.section);
      section = ["general", "description", "files"].fetch(req.params.section, "general");
      console.log(section);
      switch (section) {
        case "general":
          map = check.map({
            name: data.name,
            category: data.category,
            summary: data.summary
          }, {
            name: check.unemptyString,
            category: check.unemptyString,
            summary: check.unemptyString
          });
          if (!check.every(map)) {
            req.flash("error", "Something is missing...");
            return res.render("../views/edit/" + section + ".ect", {
              mod: mod
            });
          }
          mod.name = data.name;
          mod.category = data.category;
          mod.summary = data.summary;
          mod.save(function(err, doc) {
            if (err) {
              req.flash("error", "Something is missing...");
              return res.render("../views/edit/" + section + ".ect", {
                mod: mod,
                title: "Editing " + mod.name,
                url: "/mod/" + mod.slug + "/edit"
              });
            }
            req.flash("success", "Succesfully edited!");
            return res.redirect("/mod/" + mod.slug + "/edit");
          });
          break;
        case "description":
          if (!data.body) {
            req.flash("error", "Something is missing...");
            return res.render("../views/edit/" + section + ".ect", {
              mod: mod
            });
          }
          mod.body = data.body;
          mod.save(function(err, doc) {
            if (err) {
              req.flash("error", "Something is missing in mod...");
              return res.render("../views/edit/" + section + ".ect", {
                mod: mod,
                title: "Editing " + mod.name,
                url: "/mod/" + mod.slug + "/edit"
              });
            }
            req.flash("success", "Succesfully edited!");
            return res.redirect("/mod/" + mod.slug + "/edit");
          });
      }
    });
  };

  exports.index = function(req, res) {
    var filter, listing, options, page, perPage, query, sort, url_parts;
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
      } : {})
    };
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

}).call(this);
