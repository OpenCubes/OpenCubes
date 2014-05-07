###
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
###
validator = require "validator"

exports.validate = (data, rules) ->
  try
    errors =
      valid: true
      fields: {}
      errors: {}
    for name of rules
      rule = rules[name]
      value = data[name]
      rule.required = rule.required or false
      if rule.required
        if not value or value is ""
          errors.errors[name] =
            field: name
            description: "#{rule.name or name} is required"
          errors.valid = false
      else 
        if rule
          for check in rule.rules
            result = check.check value
            if result is false
              errors.errors[name] =
                field: name
                description: check.string(rule.name or name)
              errors.valid = false
      if value
        if rule.escape is undefined or rule.escape
          if rule.trim is true or rule.trim is undefined
            errors.fields[name] = validator.escape value.trim()
          else
            errors.fields[name] = validator.escape value
        else
          if rule.trim is true or rule.trim is undefined
            errors.fields[name] = value.trim()
          else
            errors.fields[name] = value
    return errors
  catch err
    console.log err.stack.red

exports.rules =
  size: (min, max) ->
    return  {
      check: (data="") ->
        if data.length > max
          return false
        if data.length < min
          return false
        return true
      string: (fieldName) ->
        return "#{fieldName} must be between #{min} and #{max} characters"
    }
  regex: (regex) ->
    return  {
      check: (data) ->
        if not data or data is ""
          return false
        if data.match(new RegExp(regex))
          return true
        false
      string: (fieldName) ->
        return "#{fieldName} is invalid"
    }
  email: () ->
    return  {
      check: (data) ->
        if data.match(new RegExp("[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\\.[a-zA-Z]{2,4}"))
          return true
        return false
      string: (fieldName) ->
        return "#{fieldName} is invalid"
    }
