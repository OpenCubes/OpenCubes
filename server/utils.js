(function() {
  var Q;

  String.prototype.getParent = function() {
    var index, replaced;
    replaced = this.replace(new RegExp("\\\\", "g"), "/");
    index = replaced.lastIndexOf("/");
    return replaced.substring(0, index);
  };

  Object.defineProperty(Array.prototype, "fetch", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(value, def) {
      if (this.indexOf(value) !== -1) {
        return value;
      } else {
        return def;
      }
    }
  });

  Object.defineProperty(Array.prototype, "findIn", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(obj) {
      var arr, index, keys, result;
      index = -1;
      keys = Object.keys(obj);
      arr = this;
      result = arr.filter(function(doc, idx) {
        var i, matched;
        matched = 0;
        i = keys.length - 1;
        while (i >= 0) {
          if (doc[keys[i]] === obj[keys[i]]) {
            matched++;
            if (matched === keys.length) {
              index = idx;
              return arr[idx];
            }
          }
          i--;
        }
      });
      if (index === -1) {
        return void 0;
      } else {
        return arr[index];
      }
    }
  });

  global.status = function(status, code, id, message) {
    return {
      status: status,
      code: code,
      id: id,
      message: message
    };
  };

  /*
  
  This is an awesome utility function that convert
  a classic function using callbacks into a promise styled one
  
  Usage example:
  
      function foo(foo, bar, callback){
          callback(foo + " " + bar);
      }
      pFoo = foo.toPromise(this);
      pFoo("hello, ", "world!").then(console.log);
  
  outputs "hello, world!"
  
  pass an error to call the fail function
  
  @params self the object to be applied on the function as this
  */


  Q = require("q");

  Object.defineProperty(Function.prototype, "toPromise", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(self) {
      var $this;
      $this = this;
      return function() {
        var arg, args, deferred, _i, _len;
        deferred = Q.defer();
        args = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arg = arguments[_i];
          args.push(arg);
        }
        args.push(function() {
          args = Array.prototype.slice.call(arguments);
          if (args[0] instanceof Error) {
            return deferred.reject.apply($this, args);
          } else {
            return deferred.resolve.apply($this, args);
          }
        });
        $this.apply(self, args);
        return deferred.promise;
      };
    }
  });

}).call(this);
