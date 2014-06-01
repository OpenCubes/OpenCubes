try
  raw = require("fs").readFileSync("./config.json")
catch err
  throw new Error "Config file not found. Please run `grunt configure` for help."

try
  module.exports = config = JSON.parse(raw)

  for own key, value of config
    if typeof key is "string"
      executed = /%(.+?)%/.exec(value)
      if executed
        config[key] = eval(executed[1]) or ""
catch err
  throw new Error "Config file is invalid."
