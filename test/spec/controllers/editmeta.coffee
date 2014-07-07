'use strict'

describe 'Controller: EditmetaCtrl', ->

  # load the controller's module
  beforeEach module 'opencubesDashboardApp'

  EditmetaCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    EditmetaCtrl = $controller 'EditmetaCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(scope.awesomeThings.length).toBe 3
