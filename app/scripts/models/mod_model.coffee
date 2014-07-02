#global Ember
OpencubesDashboard.Mod = DS.Model.extend(
  name: DS.attr("string")
  summary: DS.attr("string")
  body: DS.attr("string")
  slug: DS.attr "string"
  category: DS.attr("string")
)

# probably should be mixed-in...
OpencubesDashboard.Mod.reopen attributes: (->
  model = this
  Ember.keys(@get("data")).map (key) ->
    Em.Object.create
      model: model
      key: key
      valueBinding: "model." + key


).property()
