'use strict'

###*
 # @ngdoc overview
 # @name opencubesDashboardApp
 # @description
 # # opencubesDashboardApp
 #
 # Main module of the application.
###
window.config = {
  host: "localhost:1234"
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
      .when '/:slug/edit/description',
        templateUrl: 'views/editdescription.html'
        controller: 'EditdescriptionCtrl'
      .when '/:slug',
        templateUrl: 'views/mod.html'
        controller: 'ModCtrl'
      .otherwise
        redirectTo: '/'

window.menu = true
$ ->
  $('.ui.sidebar')
  .sidebar 'attach events', '#menu-button'
