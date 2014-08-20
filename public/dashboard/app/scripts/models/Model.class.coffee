class Model

  # Dirty bit pattern
  _dirty: false
  
  # Editied fields
  _dirtyFields: []
  
  # Is the document new?
  _new: false
  
  # Constructor
  constructor: (keys) ->
    for own key, value of keys
      @[key] = value

  # Set value for such key
  set: (key, value) ->
    if typeof key is "string" and value
      @_dirty = true
      @[key] = value
      @_dirtyFields.push key

  # remove key
  remove: (key) ->
    if key and @[key]
      @_dirty = true
      delete @[key]
      @_dirtyFields.push key
  
  # Was it modified and not saved?
  isDirty: -> @_dirty
  
  # Is it new?
  isNew: -> @_new
  
  # What was modified?
  dirtyFields: -> @_dirtyFields
  
  # Save the model
  save: (callback) ->
  
  # Delete it!
  drop: (callback)->
    
  # Static methods
  
  # List mods
  @list: (query, callback)->
  
  # Fetch one mod
  @find: (slug, callback)->

window.Model = Model