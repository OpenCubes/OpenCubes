###
Creates a new Version Object.
This is useful for comparing and sorting version.
@params name the Version such as 1.7.4#1.0.0
###
module.exports = Version = (name) ->
  basicRegex = new RegExp("^(\\d+)\\.(\\d+)\\.(\\d)+#(\\d+)\\.(\\d+)\\.(\\d+)(\\-|\\.|_){0,1}(stable|alpha|beta|)$", "g")
  # see https://www.debuggex.com/i/Zs6sIQ6W50KX2Kp0.png
  matcherRegex = /^(\d+)(\.(\d+\+?)|\.(x))(\.(\d+\+?)|\.(x))#(\d+|x)(\.(\d+\+?)|\.(x))?(\.(\d+\+?)|\.(x))?((\.|-|_)(alpha|beta|stable))?$/g

  # If this is a plain version
  if basicRegex.test name
    # we reset lastIndex to avoid conflicts and null result
    # see http://stackoverflow.com/a/9257547/2533082
    basicRegex.lastIndex = 0

    match = basicRegex.exec name
    @_type = "basic"
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
    return
  if matcherRegex.test name
    # we reset lastIndex to avoid conflicts and null result
    # see http://stackoverflow.com/a/9257547/2533082
    matcherRegex.lastIndex = 0
    match = matcherRegex.exec name
    @_type = "matcher"
    @_raw = name
    @_minecraftVersion =
      major: match[1]
      minor: match[3]
      patch: match[6]
      raw: name.split("#")[0]
    @_modVersion =
      major: match[8]
      minor: match[10]
      patch: match[13]
      raw: name.split("#")[1]
    return


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

Version::getModVersion = () ->
  return @_modVersion

Version::getMinecraftVersion = () ->
  return @_minecraftVersion

compare = (a, b) ->
  a = a or "x"
  # same version
  if a is b then return true
  # if the part is x, then it equals
  if a is "x" then return true
  # if b is greater than x in  x+
  if /(\d)+\+/g.test(a)
    if b > (/(\d+)\+/g.exec(a)[1] - 0)
      return true
  return false
###
Returns whether this is greater than specified version
@params version (string) to compare
###
Version::isGreaterThan = (version) ->
  if @_type is "basic"
    return @_index > new Version(version).getIndex()
  throw new Error "Not plain type"

Version::matches = (version) ->
  if @_type is "basic" then throw new Error "Not matcher type"
  v = new Version(version)
  other =
    mc: v.getMinecraftVersion()
    mod: v.getModVersion()
  self =
    mc: @getMinecraftVersion()
    mod: @getModVersion()
  if compare(self.mc.minor, other.mc.minor) is false
    return false
  if compare(self.mc.major, other.mc.major) is false
    return false
  if compare(self.mc.patch, other.mc.patch) is false
    return false
  if compare(self.mod.minor, other.mod.minor) is false
    return false
  if compare(self.mod.major, other.mod.major) is false
    return false
  if compare(self.mod.patch, other.mod.patch) is false
    return false
  return true
