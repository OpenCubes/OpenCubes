class InvalidParamsError extends HttpError

  constructor: (message) ->
    super message or "A parameter is missing or invalid. Please retry.",
  	  400, "INVALID_PARAMS"


module.exports = InvalidParamsError
