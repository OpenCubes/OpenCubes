class HttpError extends Error

  constructor: (message, code, id) ->
    @message = message or "Unknown error"
    @code = code or 500
    @id = id or "UNKNOWN_ERROR"
    super @id

  send: (req, res, format=req.accepts("json", "html", "text")) ->
    switch format
      when 'json'
        return res.send @code, {
          status: "error"
          message: @message
          id: @id
        }
      when 'html', 'text'
        return res.send @code, "An error has occured: #{@message} (#{@id})"
    res.send @code, {
      status: "error"
      message: @message
      id: @id
    }

module.exports = global.HttpError = HttpError
global.DatabaseError =      require './DatabaseError'
global.ForbiddenError =     require './ForbiddenError'
global.InvalidDataError =   require './InvalidDataError'
global.InvalidParamsError = require './InvalidParamsError'
global.NotFoundError =      require './NotFoundError'
global.UnauthorizedError =  require './UnauthorizedError'
