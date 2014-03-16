String::getParent = ->
  replaced = @replace(new RegExp("\\\\", "g"), "/")
  index = replaced.lastIndexOf("/")
  replaced.substring 0, index

Object.defineProperty Array::, "fetch",
  enumerable: false
  configurable: false
  writable: false
  value: (value, def) ->
    (if @indexOf(value) isnt -1 then value else def)

Object.defineProperty Array::, "findIn",
  enumerable: false
  configurable: false
  writable: false
  value: (obj) ->
    index = -1 # not found initially
    keys = Object.keys(obj)
    
    # filter the collection with the given criterias
    arr = this
    result = arr.filter((doc, idx) ->
      
      # keep a counter of matched key/value pairs
      matched = 0
      
      # loop over criteria
      i = keys.length - 1

      while i >= 0
        if doc[keys[i]] is obj[keys[i]]
          matched++
          
          # check if all the criterias are matched
          if matched is keys.length
            index = idx
            return arr[idx]
        i--
      return
    )
    (if index is -1 then `undefined` else arr[index])

