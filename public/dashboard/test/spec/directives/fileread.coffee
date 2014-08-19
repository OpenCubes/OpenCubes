'use strict'

describe 'Directive: fileread', ->

  # load the directive's module
  beforeEach module 'opencubesDashboardApp'

  scope = {}

  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()

  it 'should make hidden element visible', inject ($compile) ->
    element = angular.element '<fileread></fileread>'
    element = $compile(element) scope
    expect(element.text()).toBe 'this is the fileread directive'
