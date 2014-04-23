(function() {
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
    return app.api.carts.addTo(cart, id).then(function(cart) {
      return res.send({
        status: "success",
        code: 201,
        message: "Successfully pushed to cart",
        data: {
          id: id,
          cart: cart
        }
      });
    }).fail(function(err) {});
  };

  exports.lsCart = function(req, res) {
    var id;
    id = req.params.cart;
    return app.api.carts.view(id).then(function(cart) {
      return res.send(cart);
    }).fail(function(err) {
      console.log(err);
      return res.send({
        status: "error",
        id: "database_error",
        code: 500,
        message: "An error has occured with the database"
      });
    });
  };

  exports.createCart = function(req, res) {
    return app.api.carts.create().then(function(cart) {
      return res.send({
        status: "success",
        code: 201,
        message: "Successfully created cart",
        data: {
          cart: cart
        }
      });
    }).fail(function(err) {
      console.log(err);
      return res.send({
        status: "error",
        id: "database_error",
        code: 500,
        message: "An error has occured with the database"
      });
    });
  };

  exports.view = function(req, res) {
    var user;
    if (req.user) {
      user = req.user._id;
    } else {
      user = "";
    }
    app.api.mods.view(user, req.params.id, req.cookies.cart_id, req.user, true).then(function(mod) {
      mod.urls = {
        web: "/mod/" + mod.slug,
        logo: "/assets/" + mod.slug + ".png"
      };
      return res.send(mod);
    }).fail(function(err) {
      return res.send(500, err.message);
    });
  };

  exports.search = function(req, res) {
    app.api.mods.search(req.getUserId(), req.params.string).then(function(mods) {
      return res.send(mods.slice(-40));
    }).fail(function(err) {
      return res.send(500, err.message);
    });
  };

  exports.list = function(req, res) {
    var filter, options, page, perPage, sort, user;
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
    if (req.user) {
      user = req.user._id;
    } else {
      user = "";
    }
    app.api.mods.list(user, options).then(function(mods, count) {
      var mod, _i, _len;
      count = mods.totalCount;
      for (_i = 0, _len = mods.length; _i < _len; _i++) {
        mod = mods[_i];
        mod.urls = {
          api: "/api/mods/view/" + mod.slug + ".json",
          web: "/mod/" + mod.slug,
          logo: "/assets/" + mod.slug + ".png"
        };
      }
      res.send({
        status: "success",
        mods: mods,
        count: mods.count,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    }).fail(function(err) {
      console.log(err);
      return res.send(500, err.message);
    });
  };

}).call(this);
