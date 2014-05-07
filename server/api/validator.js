/*
Data schema : hash key/value

Rules Schema :

{
    key: {name: name, rules: [rule1, rule2]}
}

result :
{
  valid: boolean
  key: description
}
*/


(function() {
  var validator;

  validator = require("validator");

  exports.validate = function(data, rules) {
    var check, err, errors, name, result, rule, value, _i, _len, _ref;
    try {
      errors = {
        valid: true,
        fields: {},
        errors: {}
      };
      for (name in rules) {
        rule = rules[name];
        value = data[name];
        rule.required = rule.required || false;
        if (rule.required) {
          if (!value || value === "") {
            errors.errors[name] = {
              field: name,
              description: "" + (rule.name || name) + " is required"
            };
            errors.valid = false;
          }
        } else {
          if (rule) {
            _ref = rule.rules;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              check = _ref[_i];
              result = check.check(value);
              if (result === false) {
                errors.errors[name] = {
                  field: name,
                  description: check.string(rule.name || name)
                };
                errors.valid = false;
              }
            }
          }
        }
        if (value) {
          if (rule.escape === void 0 || rule.escape) {
            if (rule.trim === true || rule.trim === void 0) {
              errors.fields[name] = validator.escape(value.trim());
            } else {
              errors.fields[name] = validator.escape(value);
            }
          } else {
            if (rule.trim === true || rule.trim === void 0) {
              errors.fields[name] = value.trim();
            } else {
              errors.fields[name] = value;
            }
          }
        }
      }
      return errors;
    } catch (_error) {
      err = _error;
      return console.log(err.stack.red);
    }
  };

  exports.rules = {
    size: function(min, max) {
      return {
        check: function(data) {
          if (data == null) {
            data = "";
          }
          if (data.length > max) {
            return false;
          }
          if (data.length < min) {
            return false;
          }
          return true;
        },
        string: function(fieldName) {
          return "" + fieldName + " must be between " + min + " and " + max + " characters";
        }
      };
    },
    regex: function(regex) {
      return {
        check: function(data) {
          if (!data || data === "") {
            return false;
          }
          if (data.match(new RegExp(regex))) {
            return true;
          }
          return false;
        },
        string: function(fieldName) {
          return "" + fieldName + " is invalid";
        }
      };
    },
    email: function() {
      return {
        check: function(data) {
          if (data.match(new RegExp("[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\\.[a-zA-Z]{2,4}"))) {
            return true;
          }
          return false;
        },
        string: function(fieldName) {
          return "" + fieldName + " is invalid";
        }
      };
    }
  };

}).call(this);
