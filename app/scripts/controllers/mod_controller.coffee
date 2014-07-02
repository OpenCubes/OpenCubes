OpencubesDashboard.ModController = Ember.ObjectController.extend
  setupController: (controller, mod) ->
    controller.set('model', mod)
