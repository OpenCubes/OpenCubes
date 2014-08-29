class DatabaseError extends HttpError

  constructor: (message) ->
    super message or "Error with database", 500, "DATABASE_ERROR"


module.exports = DatabaseError
