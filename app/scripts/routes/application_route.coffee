OpencubesDashboard.ApplicationRoute = Ember.Route.extend
  model: ->
    @store.find('mod')
