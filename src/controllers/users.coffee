###
Module dependencies.
###
mongoose = require("mongoose")
User = mongoose.model("User")
utils = require("./utils")
error = errors = require "../error"

#  , utils = require('../../lib/utils');
login = (req, res) ->
  redirectTo = (if req.session.returnTo then req.session.returnTo else "/")
  delete req.session.returnTo

  res.redirect redirectTo
  return

exports.signin = (req, res) ->


###
Auth callback
###
exports.authCallback = login

###
Show login form
###
exports.login = (req, res) ->
  res.render "users/login.ect",
    title: "Login"
    target: req.query.target or ""

  return


#message: req.flash('error')

###
Show sign up form
###
exports.signup = (req, res) ->
  res.render "users/signup.ect",
    title: "Sign up"
    user: new User()

  return


###
Logout
###
exports.logout = (req, res) ->
  req.logout()
  res.redirect "/login"
  return


###
Session
###
exports.session = login

###
Create user
###
exports.create = (req, res, next) ->
  app.api.users.registerLocal(req.getUserId(), req.body).then((user) ->
    req.logIn user, (err) ->
      return next(err)  if err
      res.redirect "/"
  ).fail (err) ->
    console.log err
    return res.render("users/signup.ect",
      user: user
      title: "Sign up"
    )

###
Show profile
###
exports.show = (req, res) ->
  app.api.users.view(req.getUserId(), req.params.name).then((user) ->
    res.render "users/user.ect",
      title: user.name
      user: user
    return
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"

exports.requestPasswordRecovery = (req, res) ->
  res.render("users/askRecover.ect")

exports.doRequestPasswordRecovery = (req, res) ->
  app.api.users.requestPasswordRecovery(req.body.email)
  res.send 200, "We have sent you an email if #{req.body.email} exists"

exports.recover = (req, res) ->
  if app.api.users.recoverPassword(req.params.uid)
    res.render("users/recover.ect")

exports.doRecover = (req, res) ->
  app.api.users.recoverPassword(req.params.uid, req.body.password)
  res.send 200
