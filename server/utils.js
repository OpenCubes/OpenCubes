(function() {
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

}).call(this);
