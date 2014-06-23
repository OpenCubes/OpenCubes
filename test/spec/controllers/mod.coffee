'use strict'

describe 'Controller: ModCtrl', ->

  # load the controller's module
  beforeEach module 'opencubesDashboardApp'

  ModCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ModCtrl = $controller 'ModCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(scope.awesomeThings.length).toBe 3
