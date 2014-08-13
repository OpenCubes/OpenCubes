cache = {}
class Mod extends Model
  save: (callback)=>
    data = _.pick @, @dirtyFields()
    if @isDirty() and not @isNew()
      $.ajax
        url: "//#{window.config.host}/api/v1/mods/#{@slug}"
        dataType: "json"
        type: "PUT"
        data: data
        success: (data) ->
            callback()
        error: callback
  @find: (slug, callback) ->
    console.log "find"
    if not cache[slug]
      $.ajax
        url: "//#{window.config.host}/api/v1/mods/#{slug}"
        dataType: "jsonp"
        success: (data) ->
          cache[slug] = new Mod data.result
          console.log "cached", cache[slug]
          callback undefined, cache[slug]
        
        error: callback
    else callback undefined, cache[slug]
  
      
  @list: (query, callback) ->
    $.ajax
      url: "//#{window.config.host}/api/v1/mods"
      dataType: "jsonp"
      data: query
      success: (data) ->
        array = []
        for mod in data.mods
          array.push(new Mod mod)
        console.log array
        callback array
window.Mod = Mod

    