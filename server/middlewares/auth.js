exports.requiresLogin = function (req, res, next) {
    console.log('Hello')
  if (req.isAuthenticated()) return next()
  res.redirect('/login?target='+req.url);
}