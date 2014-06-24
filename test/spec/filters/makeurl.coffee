'use strict'

describe 'Filter: makeUrl', ->

  # load the filter's module
  beforeEach module 'opencubesDashboardApp'

  # initialize a new instance of the filter before each test
  makeUrl = {}
  beforeEach inject ($filter) ->
    makeUrl = $filter 'makeUrl'

  it 'should return the input prefixed with "makeUrl filter:"', ->
    text = 'angularjs'
    expect(makeUrl text).toBe ('makeUrl filter: ' + text)
