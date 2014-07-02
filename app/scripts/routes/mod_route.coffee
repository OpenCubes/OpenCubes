OpencubesDashboard.ModRoute = Ember.Route.extend(
  model: (params) ->
    @get('store').find('mod', params.mod_id)
)

