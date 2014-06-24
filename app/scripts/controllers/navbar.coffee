'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:NavbarCtrl
 # @description
 # # NavbarCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'NavbarCtrl', ['$scope', 'Navbar', ($scope, Navbar) ->
    $scope.items = Navbar
    $scope.getClass = (path) ->
      console.log path
      if window.location.href.endsWith path
        console.log path, "active"
        return "active"
      else
        return ""
  ]
