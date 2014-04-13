/*
pattern
ip : {
  requests: int
}
*/


(function() {
  var clients, getClientAddress;

  clients = {};

  /*
  @param ipTimeout is how long the IP Address is kept on the server
  @param maxRequests is how many request a single client can execute before it gets blocked
  @maxWait is how long the request can last in order to be able to continue if the flood controll is reached
  */


  module.exports = function(ipTimeout, maxRequests, maxWait) {
    return function(req, res, next) {
      var ip;
      ip = getClientAddress(req);
      if (clients[ip]) {
        if (clients[ip].requests === maxRequests) {
          return res.send(400, "flood_control");
        } else {
          clients[ip].requests++;
          return next();
        }
      } else {
        clients[ip] = {
          requests: 1
        };
        setTimeout(function() {
          return clients[ip] = void 0;
        }, ipTimeout);
        return next();
      }
    };
  };

  getClientAddress = function(req) {
    var ip;
    ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    console.log(ip);
    return ip;
  };

}).call(this);
