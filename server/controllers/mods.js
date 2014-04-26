(function() {
  var URI, archiver, check, error, errors, fs, paginator, send, url, utils, uuid;

  utils = require("./utils");

  paginator = require("../paginator.js");

  url = require("url");

  URI = require("URIjs");

  check = require("check-types");

  archiver = require("archiver");

  send = require("send");

  errors = error = require("../error");

  /*
  Route for viewing mod
  */


  exports.view = function(req, res) {
    var user;
    if (req.user) {
      user = req.user._id;
    } else {
      user = "";
    }
    return app.api.mods.view(user, req.params.id, req.cookies.cart_id, req.user, true).then(function(mod) {
      res.render("view.ect", {
        mod: mod,
        canEdit: (req.user ? mod.author === req.user.id || req.user.role === "admin" ? true : void 0 : false),
        title: mod.name + " - OpenCubes"
      });
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

  exports.index = function(req, res) {
    var cart, filter, listing, options, page, perPage, query, sort, url_parts, user;
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
    if (req.user) {
      user = req.user._id;
    } else {
      user = "";
    }
    app.api.mods.list(user, options).then(function(mods, count) {
      count = mods.totalCount;
      console.log(count);
      return res.render("index.ect", utils.ectHelpers(req, {
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
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

  exports.edit = function(req, res) {
    return app.api.mods.load(req.getUserId(), req.params.id).then(function(container) {
      console.log(container);
      return res.render("edit/" + (req.params.section || "general") + ".ect", {
        mod: container.mod,
        deps: container.deps,
        title: "Editing " + container.mod.name,
        url: "/mod/" + container.mod.slug + "/edit",
        versions: container.versions
      });
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

  exports.doEdit = function(req, res) {
    var args;
    args = req.body;
    return app.api.mods.edit(req.getUserId(), req.params.id, args.name, args.value).then(function(status) {
      return res.send(200, "Saved!");
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

  exports.getLogo = function(req, res) {
    if (!req.params.slug) {
      return res.send(403, "no slug");
    }
    return app.api.mods.view(req.getUserId(), req.params.slug, void 0, void 0, false).then(function(mod) {
      if (!mod.logo) {
        return send(req, __dirname.getParent().getParent() + "/public/images/puzzle.png").pipe(res);
      }
      return send(req, __dirname.getParent() + "/uploads/" + mod.logo).pipe(res);
    }).fail(function(err) {
      return send(req, __dirname.getParent().getParent() + "/public/images/puzzle.png").pipe(res);
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
      if (err) {
        console.log(err);
        return res.send(500, "something went wrong while moving");
      }
      return app.api.mods.edit(req.getUserId(), req.params.id, "logo", uid).then(function(status) {
        return res.send(200, "Saved!");
      }).fail(function(err) {
        return errors.handleHttp(err, req, res, "text");
      });
    });
  };

  /*
  Star a mod
  */


  exports.star = function(req, res) {
    var slug;
    slug = req.params.slug;
    if (!slug || slug === "") {
      return res.send(400, "Missing slug");
    }
    if (!req.user) {
      return res.send(401, "You are not logged in");
    }
    return app.api.mods.star(req.getUserId(), req.params.slug).then(function(mod) {
      return res.redirect("/mod/" + mod.slug);
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

  exports.upload = function(req, res) {
    res.render("../views/upload.ect");
  };

  exports.doUpload = function(req, res) {
    var mod;
    mod = {
      name: req.body.name,
      summary: req.body.summary,
      body: req.body.description,
      author: req.user._id,
      category: req.body.category || "misc"
    };
    return app.api.mods.add(req.getUserId(), mod).then(function(s) {
      return res.redirect("/");
    }).fail(function(err) {
      return res.render("upload.ect", {
        hasError: true
      });
    });
  };

  exports.cart = function(req, res) {
    if (!req.params.id) {
      res.reason = "Missing id";
      return utils.notfound(req, res, function() {});
    }
    return app.api.cart.view(req.params.id).then(function(cart) {
      return res.render("users/cart.ect", {
        cart: cart
      });
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

  exports.search = function(req, res) {
    res.render("mods/search.ect");
  };

}).call(this);
