OpencubesDashboard.Router.map( ->
  @resource 'mods', path: '/'
  @resource 'mod', ->
    @resource 'mod', path: '/:mod_model.j_id', ->
      @resource 'view', path: '/:mod_model.j_id'
      @resource 'edit', path: '/edit'

    @route('create')


)

OpencubesDashboard.ModsRoute = Ember.Route.extend
  model: ->
    @store.find 'mod'
