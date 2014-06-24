'use strict'

describe 'Controller: NavbarCtrl', ->

  # load the controller's module
  beforeEach module 'opencubesDashboardApp'

  NavbarCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    NavbarCtrl = $controller 'NavbarCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(scope.awesomeThings.length).toBe 3
