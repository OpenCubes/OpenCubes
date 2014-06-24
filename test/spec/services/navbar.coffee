'use strict'

describe 'Service: Navbar', ->

  # load the service's module
  beforeEach module 'opencubesDashboardApp'

  # instantiate service
  Navbar = {}
  beforeEach inject (_Navbar_) ->
    Navbar = _Navbar_

  it 'should do something', ->
    expect(!!Navbar).toBe true
