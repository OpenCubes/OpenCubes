###
Creates a new Version Object.
This is useful for comparing and sorting version.
@params name the Version such as 1.7.4#1.0.0
###
module.exports = Version = (name) ->
  regex = new RegExp("^(\\d+)\\.(\\d+)\\.(\\d)+#(\\d+)\\.(\\d+)\\.(\\d+)(\\-|\\.|_){0,1}(stable|alpha|beta|)$", "g")
  match = regex.exec name
  @_raw = name
  @_minecraftVersion =
    major: match[1]
    minor: match[2]
    patch: match[3]
    raw: name.split("#")[0]
    index: (match[1] + "" + match[2] + "" + match[3]) - 0
  @_modVersion =
    major: match[4]
    minor: match[5]
    patch: match[6]
    raw: name.split("#")[1]
    index: (match[4] + "" + match[5] + "" + match[6]) - 0
  @_index =  @_minecraftVersion.index + "" + @_modVersion.index - 0

###
Returns the raw version (at the beginning
###
Version::getRaw = () ->
  return @_raw
###
Returns the version index (1.7.3#1.0.0 -> 173100)
###
Version::getIndex = () ->
  return @_index


###
Returns whether this is lower than specified version
@params version (string) to compare
###
Version::isLowerThan = (version) ->
  return new Version(version).isGreaterThan(@_raw)

###
Returns whether this is greater than specified version
@params version (string) to compare
###
Version::isGreaterThan = (version) ->
  return @_index > new Version(version).getIndex()
###
Returns whether this is greater than specified version
@params version (string) to compare
###
Version::isGreaterThan = (version) ->
  return @_index > new Version(version).getIndex()



