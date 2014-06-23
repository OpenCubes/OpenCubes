'use strict'

describe 'Controller: EditdescriptionCtrl', ->

  # load the controller's module
  beforeEach module 'opencubesDashboardApp'

  EditdescriptionCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    EditdescriptionCtrl = $controller 'EditdescriptionCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(scope.awesomeThings.length).toBe 3
