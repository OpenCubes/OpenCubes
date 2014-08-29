class NotFoundError extends HttpError

  constructor: (message) ->
    super message or "Not found", 404, "NOT_FOUND"


module.exports = NotFoundError
