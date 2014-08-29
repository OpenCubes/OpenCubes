class InvalidParamsError extends HttpError

  constructor: (message) ->
    super message or "A data is missing or invalid.",
  	  400, "INVALID_DATA"


module.exports = InvalidParamsError
