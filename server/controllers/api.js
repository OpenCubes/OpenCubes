(function() {
  var Cart, Mod, mongoose;

  exports.ajaxLogin = function(req, res) {
    res.render("forms/login.ect");
  };

  exports.glyphicons = function(req, res) {
    var data;
    data = require("../../public/api/glyphicons.json");
    console.log(data);
    res.render("utils/glyphicons.ect", {
      list: data
    });
  };

  exports.parseMd = function(req, res) {
    return res.send(req.application.parser(req.body.markdown || ""));
  };

  mongoose = require("mongoose");

  Mod = mongoose.model("Mod");

  Cart = mongoose.model("Cart");

  exports.addToCart = function(req, res) {
    var cart, id;
    id = req.params.id;
    cart = req.params.cart;
    if (!id || !cart) {
      return res.send({
        status: "error",
        id: "missing_param",
        code: 400,
        message: "Something is missing..."
      });
    }
    return Cart.findById(cart, function(err, cart) {
      if (err || !cart) {
        return res.send({
          status: "error",
          id: "database_error",
          code: 500,
          message: "An error has occured with the database"
        });
      }
      cart.mods.push(id);
      cart.save();
      return res.send({
        status: "success",
        code: 201,
        message: "Successfully pushed to cart",
        data: {
          id: id,
          cart: cart
        }
      });
    });
  };

  exports.lsCart = function(req, res) {
    var id;
    id = req.params.cart;
    return Cart.findById(id).populate("mods").exec(function(err, cart) {
      return res.send(cart);
    });
  };

  exports.createCart = function(req, res) {
    var cart;
    console.log("creeating cart");
    cart = new Cart();
    cart.save();
    return res.send({
      status: "success",
      code: 201,
      message: "Successfully created cart",
      data: {
        cart: cart
      }
    });
  };

  exports.view = function(req, res) {
    setTimeout((function() {
      Mod.load({
        slug: req.params.id,
        $lean: true
      }, function(err, mod) {
        var Version;
        if (err || !mod) {
          if (err) {
            console.log(err);
          }
          return res.send(status("error", "404", "db_error", "Can't find mod `" + req.params.id + "`"));
        }
        mod.htmlbody = req.application.parser(mod.body);
        mod.urls = {
          web: "/mod/" + mod.slug,
          logo: "/assets/" + mod.slug + ".png"
        };
        Version = mongoose.model("Version");
        return Version.find({
          mod: mod._id
        }, function(err, versions) {
          var file, output, version, _i, _j, _len, _len1, _ref;
          if (err) {
            return res.send(mod);
          }
          if (!versions) {
            res.send(mod);
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
          return res.send(mod);
        });
      });
    }), 0);
  };

  exports.search = function(req, res) {
    var q, regex;
    regex = new RegExp(req.params.string, 'i');
    console.log(regex);
    q = Mod.find({
      name: regex
    });
    q.populate("author", "username");
    return q.exec(function(err, mods) {
      return res.send(mods);
    });
  };

  exports.list = function(req, res) {
    var filter, options, page, perPage, sort;
    page = (req.params.page || 1) - 1;
    sort = (req.param("sort")) || "-date";
    filter = (req.param("filter")) || "all";
    perPage = req.params.perPage || 25;
    options = {
      perPage: perPage,
      page: page,
      sort: sort,
      filter: filter,
      criteria: (filter !== "all" ? {
        category: filter
      } : {}),
      doLean: true
    };
    Mod.list(options, function(err, mods) {
      if (err) {
        return res.send(status("error", 500, "db_error", "Issues with database. Please retry or contact us"));
      }
      Mod.count().exec(function(err, count) {
        var mod, _i, _len;
        for (_i = 0, _len = mods.length; _i < _len; _i++) {
          mod = mods[_i];
          mod.urls = {
            api: "/api/mods/view/" + mod.slug + ".json",
            web: "/mod/" + mod.slug,
            logo: "/assets/" + mod.slug + ".png"
          };
        }
        return res.send({
          status: "success",
          mods: mods,
          page: page + 1,
          pages: Math.ceil(count / perPage)
        });
      });
    });
  };

}).call(this);
