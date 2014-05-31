Q = require "q"
nodemailer = require "nodemailer"
config = require "../config"
marked = require "marked"
smtpTransport = nodemailer.createTransport config.mail.transport, config.mail.options
module.exports = (options, markdown) ->
  deferred = Q.defer()
  if markdown
    html = marked(markdown)
    options.html = html
    # options.plain = html.replace /
  smtpTransport.sendMail options, (error, response) ->
    if error
      return deferred.reject error
    else
      return deferred.resolve response
  return deferred.promise
