class ForbiddenError extends HttpError

  constructor: (message) ->
    super message or "Acces denied.", 403, "Forbidden"


module.exports = ForbiddenError
