OpencubesDashboard.ModEditController = Ember.ObjectController.extend(
  needs: 'mod'
  actions:
    save: ->
      self = this
      @get('buffer').forEach (attr)->
        self.get('controllers.mod.model').set(attr.key, attr.value)
      @transitionToRoute 'mod', @get('model')
)
