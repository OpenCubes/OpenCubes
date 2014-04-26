/*
Module dependencies.
*/


(function() {
  var User, error, errors, login, mongoose, utils;

  mongoose = require("mongoose");

  User = mongoose.model("User");

  utils = require("./utils");

  error = errors = require("../error");

  login = function(req, res) {
    var redirectTo;
    redirectTo = (req.session.returnTo ? req.session.returnTo : "/");
    delete req.session.returnTo;
    res.redirect(redirectTo);
  };

  exports.signin = function(req, res) {};

  /*
  Auth callback
  */


  exports.authCallback = login;

  /*
  Show login form
  */


  exports.login = function(req, res) {
    console.log(req.query);
    res.render("users/login.ect", {
      title: "Login",
      target: req.query.target || ""
    });
  };

  /*
  Show sign up form
  */


  exports.signup = function(req, res) {
    res.render("users/signup.ect", {
      title: "Sign up",
      user: new User()
    });
  };

  /*
  Logout
  */


  exports.logout = function(req, res) {
    req.logout();
    res.redirect("/login");
  };

  /*
  Session
  */


  exports.session = login;

  /*
  Create user
  */


  exports.create = function(req, res, next) {
    return app.api.users.registerLocal(req.getUserId(), req.body).then(function(user) {
      return req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    }).fail(function(err) {
      console.log(err);
      return res.render("users/signup.ect", {
        user: user,
        title: "Sign up"
      });
    });
  };

  /*
  Show profile
  */


  exports.show = function(req, res) {
    return app.api.users.view(req.getUserId(), req.params.name).then(function(user) {
      console.log(user);
      res.render("users/user.ect", {
        title: user.name,
        user: user
      });
    }).fail(function(err) {
      return errors.handleHttp(err, req, res, "text");
    });
  };

}).call(this);
