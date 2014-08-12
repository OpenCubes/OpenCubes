'use strict'

###*
 # @ngdoc overview
 # @name opencubesDashboardApp
 # @description
 # # opencubesDashboardApp
 #
 # Main module of the application.
###


String::hashCode = ->
  hash = 0
  i = undefined
  chr = undefined
  len = undefined
  return hash  if @length is 0
  i = 0
  len = @length

  while i < len
    chr = @charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 # Convert to 32bit integer
    i++
  hash


window.config = {
  host: "opencubes-c9-vinz243.c9.io"
}
angular
  .module('opencubesDashboardApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config ($routeProvider) ->
    $routeProvider
      .when '/',
        templateUrl: 'views/main.html'
        controller: 'MainCtrl'
      .when '/about',
        templateUrl: 'views/about.html'
        controller: 'AboutCtrl'
      .when '/:slug/edit/body',
        templateUrl: 'views/editdescription.html'
        controller: 'EditdescriptionCtrl'
      .when '/:slug',
        templateUrl: 'views/mod.html'
        controller: 'ModCtrl'
      .when '/add',
        templateUrl: 'views/addmod.html'
        controller: 'AddmodCtrl'
      .when '/:slug/edit/meta',
        templateUrl: 'views/editmeta.html'
        controller: 'EditmetaCtrl'
      .when '/:slug/edit/versions',
        templateUrl: 'views/editversion.html'
        controller: 'EditversionCtrl'
      .when '/:slug/stats',
        templateUrl: 'views/stats.html'
        controller: 'StatsCtrl'
      #.otherwise
      #  redirectTo: '/'

window.menu = true
$ ->
