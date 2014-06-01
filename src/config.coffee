try
  module.exports = config = JSON.parse(require("fs").readFileSync("./config.json"))

  for own key, value of config
    if typeof key is "string"
      executed = /%(.+?)%/.exec(value)
      if executed
        config[key] = eval(executed[1]) or ""
catch err
  throw new Error "Config file not found. Please run `grunt configure` for help."
