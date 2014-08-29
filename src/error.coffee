


exports.errors = errors =
  INVALID_PARAMS:
    code: 400
    id: "INVALID_PARAMS"
    message: "A parameter is missing or invalid. Please retry."
    build: (message) -> new InvalidParamsError message
  INVALID_DATA:
    code: 400
    id: "INVALID_DATA"
    message: "A data is missing or invalid. Please fix it and retry."
    build: (message) -> new InvalidDataError message
  NOT_FOUND:
    id: "NOT_FOUND"
    code: 404
    message: "Can't found requested object. Please retry"
    build: (message) -> new NotFoundError message
  UNAUTHORIZED:
    id: "UNAUTHORIZED"
    code: 401
    message: "Please login first"
    build: (message) -> new UnauthorizedError message
  FORBIDDEN:
    id: "FORBIDDEN"
    code: 403
    message: "Access denied."
    build: (message) -> new ForbiddenError message
  DATABASE_ERROR:
    id: "DATABASE_ERROR"
    code: 500
    message: "Error with databse. Please retry"
    build: (message) -> new DatabaseError message

exports.throwError = throwError = (message, id) ->
  # if typeof message is "string" then err = new Error message else err = message
  # err.type = id
  # err.data = errors[id]
  # return err
  if message
    if typeof message is "number" then return throwError undefined, message
    if typeof message isnt "string"
       console.log "Usage of errors is deprecated." + message
       return
  return errors[id].build message

exports.handleHttp = handleHttp = (err, req, res) ->
  console.log("   Error - #{err.message} (#{err.type}) on #{req.url}".red)
  console.log(err.stack)
  if err.send then return err.send req, res
  handleHttp(new HttpError(message, 520), req, res);

exports.handleResult = (err, doc, callback) ->
  if callback
    return callback throwError(err, "DATABASE_ERROR") if err
    return callback throwError("Not found", "NOT_FOUND") if not doc
    return callback doc
  else
    return throwError(err, "DATABASE_ERROR") if err
    return throwError("Not found", "NOT_FOUND") if not doc
    return doc
