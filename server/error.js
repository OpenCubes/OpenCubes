(function() {
  var errors, throwError;

  exports.errors = errors = {
    INVALID_PARAMS: {
      code: 400,
      id: "INVALID_PARAMS",
      message: "A parameter is missing or invalid. Please retry"
    },
    NOT_FOUND: {
      id: "NOT_FOUND",
      code: 404,
      message: "Can't found requested object. Please retry"
    },
    UNAUTHORIZED: {
      id: "UNAUTHORIZED",
      code: 401,
      message: "Please login first"
    },
    FORBIDDEN: {
      id: "FORBIDDEN",
      code: 403,
      message: "Access denied."
    },
    DATABASE_ERROR: {
      id: "DATABASE_ERROR",
      code: 500,
      message: "Error with databse. Please retry"
    }
  };

  exports.throwError = throwError = function(message, id) {
    var err;
    if (typeof message === "string") {
      err = new Error(message);
    } else {
      err = message;
    }
    err.type = id;
    err.data = errors[id];
    return err;
  };

  exports.handleHttp = function(err, req, res, format) {
    if (format == null) {
      format = "text";
    }
    console.log(("   Error - " + err.message + " (" + err.type + ") on " + req.url).red);
    return res.send(err.data.code, "" + err.data.type + ": " + err.message);
  };

  exports.handleResult = function(err, doc, callback) {
    if (callback) {
      if (err) {
        return callback(throwError(err, "DATABASE_ERROR"));
      }
      if (!doc) {
        return callback(throwError("Not found", "NOT_FOUND"));
      }
      return callback(doc);
    } else {
      if (err) {
        return throwError(err, "DATABASE_ERROR");
      }
      if (!doc) {
        return throwError("Not found", "NOT_FOUND");
      }
      return doc;
    }
  };

}).call(this);
