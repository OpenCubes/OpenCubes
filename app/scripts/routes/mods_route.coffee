OpencubesDashboard.ModsRoute = Ember.Route.extend(
  model: ->
    @get('store').find('mod')
)

