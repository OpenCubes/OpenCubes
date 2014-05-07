


exports.errors = errors =
  INVALID_PARAMS:
    code: 400
    id: "INVALID_PARAMS"
    message: "A parameter is missing or invalid. Please retry"
  INVALID_DATA:
    code: 400
    id: "INVALID_DATA"
    message: "A data is missing or invalid. Please fix it and retry."
  NOT_FOUND:
    id: "NOT_FOUND"
    code: 404
    message: "Can't found requested object. Please retry"
  UNAUTHORIZED:
    id: "UNAUTHORIZED"
    code: 401
    message: "Please login first"
  FORBIDDEN:
    id: "FORBIDDEN"
    code: 403
    message: "Access denied."
  DATABASE_ERROR:
    id: "DATABASE_ERROR"
    code: 500
    message: "Error with databse. Please retry"

exports.throwError = throwError = (message, id) ->
  if typeof message is "string" then err = new Error message else err = message
  err.type = id
  err.data = errors[id]
  return err

exports.handleHttp = (err, req, res, format="text") ->
  console.log("   Error - #{err.message} (#{err.type}) on #{req.url}".red)
  if format is "text"
    res.send err.data.code, "#{err.data.type}: #{err.message}"
  if format is "json"
    res.send err.data.code,
      type: err.data.type
      message: err.message
      id: err.type
      status: "error"
      errors: err.errors

exports.handleResult = (err, doc, callback) ->
  if callback
    return callback throwError(err, "DATABASE_ERROR") if err
    return callback throwError("Not found", "NOT_FOUND") if not doc
    return callback doc
  else
    return throwError(err, "DATABASE_ERROR") if err
    return throwError("Not found", "NOT_FOUND") if not doc
    return doc
