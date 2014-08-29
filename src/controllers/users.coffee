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

exports.edit = (req, res) ->
  app.api.users.edit(req.getUserId(), req.params.name).then((user) ->
    res.render "users/edit.ect",
      title: "Edit my profile"
      user: user
  ).fail((err) ->
    errors.handleHttp err, req, res
  )
exports.doEdit = (req, res) ->
  app.api.users.doEdit(req.getUserId(), req.params.name, req.body).then((user) ->
    res.redirect "/users/#{user.username}/edit"
  ).fail((err) ->
    errors.handleHttp err, req, res
  )


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
    console.log user
    res.render "users/user.ect",
      title: user.username
      user: user
    return
  ).fail (err) ->
    errors.handleHttp err, req, res, "text"

exports.requestPasswordRecovery = (req, res) ->
  res.render("users/askRecover.ect")

exports.doRequestPasswordRecovery = (req, res) ->
  app.api.users.requestPasswordRecovery(req.body.email)
  req.flash "success", "An email have been to #{req.body.email} if such user exists."
  res.redirect "/"

exports.recover = (req, res) ->
  if app.api.users.recoverPassword(req.params.uid)
    return res.render("users/recover.ect")
  res.send 401

exports.doRecover = (req, res) ->
  app.api.users.recoverPassword(req.params.uid, req.body.password)
  req.flash "success", "Password successfully changed. You can login now."
  res.redirect "/"
