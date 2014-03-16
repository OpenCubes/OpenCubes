exports.requiresLogin = (req, res, next) ->
  return next()  if req.isAuthenticated()
  if req.accepts("html") and not req.xhr
    return res.redirect("/login?target=" + req.url)
  else if req.accepts("json")
    return res.send(401,
      error: "unauthenticated"
    )
  res.send 401, "please login"
