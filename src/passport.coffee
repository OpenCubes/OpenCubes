mongoose = require("mongoose")
LocalStrategy = require("passport-local").Strategy
User = mongoose.model("User")
module.exports = (passport, config) ->

  # require('./initializer')

  # serialize sessions
  passport.serializeUser (user, done) ->
    done null, user.id
    return

  passport.deserializeUser (id, done) ->
    User.findOne
      _id: id
    , (err, user) ->
      done err, user
      return

    return


  # use local strategy
  passport.use new LocalStrategy((email, password, done) ->
    User.findOne
      $or:[
        {
          'email': email
        },
        {
          'username': email
        }
      ]
    , (err, user) ->
      return done(err)  if err
      unless user
        return done(null, false,
          message: "Unknown user"
        )
      unless user.authenticate(password)
        return done(null, false,
          message: "Invalid password"
        )
      done null, user

    return
  )
  return
