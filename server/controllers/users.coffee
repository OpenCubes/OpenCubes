###
Module dependencies.
###
mongoose = require("mongoose")
User = mongoose.model("User")
utils = require("./utils")

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
  console.log req.query
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
  user = new User(req.body)
  user.provider = "local"
  user.save (err) ->
    if err
      console.log err
      return res.render("users/signup.ect",
        
        #  error: utils.errors(err.errors),
        user: user
        title: "Sign up"
      )
    
    # manually login the user once successfully signed up
    req.logIn user, (err) ->
      return next(err)  if err
      res.redirect "/"

    return

  return


###
Show profile
###
exports.show = (req, res) ->
  User.findOne(username: req.params.name).exec (err, user) ->
    if err
      return utils.notfound(req, res, ->
      )
    unless user
      req.reason = "No user is called like that"
      return utils.notfound(req, res, ->
      )
    res.render "users/user.ect",
      title: user.name
      user: user

    return

  return


###
Find user by id
###
exports.user = (req, res, next, id) ->
  User.findOne(_id: id).exec (err, user) ->
    return next(err)  if err
    return next(new Error("Failed to load User " + id))  unless user
    req.profile = user
    next()
    return

  return
