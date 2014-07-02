OpencubesDashboard.ModViewRoute = Ember.Route.extend(
  model: (params) ->
    @get('store').find('mod', @modelFor('mod').id)
  setupController: (controller, model) ->
    controller.set 'model', model
    buffer = model.get('attributes').map (attr)->
      { key: attr.get('key'), value: attr.get('value') }
    controller.set 'buffer', buffer

  serialize: (model, params)  ->
    return mod_id: model.get('slug')
)
