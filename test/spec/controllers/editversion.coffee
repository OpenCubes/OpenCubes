'use strict'

describe 'Controller: EditversionCtrl', ->

  # load the controller's module
  beforeEach module 'opencubesDashboardApp'

  EditversionCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    EditversionCtrl = $controller 'EditversionCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(scope.awesomeThings.length).toBe 3
