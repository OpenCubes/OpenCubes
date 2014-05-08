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
    (if index is -1 then undefined else arr[index])

global.status = (status, code, id, message) ->
  return {
    status: status
    code: code
    id: id
    message: message
  }

###

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

###

Q = require "q"
Object.defineProperty Function::, "toPromise",
  enumerable: false
  configurable: false
  writable: false
  value: (self) ->
    $this = @
    () ->
      deferred = Q.defer()
      args = []
      args.push arg for arg in arguments
      args.push () ->
        args = Array.prototype.slice.call arguments
        if args[0] instanceof Error then return deferred.reject.apply($this, args)
        else return deferred.resolve.apply($this, args)
      try
        $this.apply(self, args)
      catch e
        console.log e
        deferred.resolve e
      return deferred.promise
