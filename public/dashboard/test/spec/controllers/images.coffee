'use strict'

describe 'Controller: ImagesCtrl', ->

  # load the controller's module
  beforeEach module 'opencubesDashboardApp'

  ImagesCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ImagesCtrl = $controller 'ImagesCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(scope.awesomeThings.length).toBe 3
