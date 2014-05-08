###
pattern
ip : {
  requests: int
}
###
clients = {}

###
@param ipTimeout is how long the IP Address is kept on the server
@param maxRequests is how many request a single client can execute before it gets blocked
@maxWait is how long the request can last in order to be able to continue if the flood controll is reached
###

module.exports = (ipTimeout, maxRequests, maxWait) ->
  return (req, res, next) ->
    ip = getClientAddress req
    if clients[ip]
      if clients[ip].requests is maxRequests
        # then we block the ip
        res.send 400, "flood_control"
      else
        clients[ip].requests++
        next()
    else
      # we add the ip
      clients[ip] =
        requests: 1
      # we remove the ip after the ipTimeout is elapsed
      setTimeout(()->
        clients[ip] = undefined
      , ipTimeout)
      next()

# Get client IP address from request object
getClientAddress = (req) ->
  ip = (req.headers['x-forwarded-for'] or '').split(',')[0] or req.connection.remoteAddress;
  console.log ip
  ip
