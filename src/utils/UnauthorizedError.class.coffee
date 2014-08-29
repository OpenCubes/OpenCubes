class UnauthorizedError extends HttpError

  constructor: (message) ->
    super message or "Please login first.", 401, "UNAUTHORIZED"


module.exports = UnauthorizedError
