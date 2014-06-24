'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:ModCtrl
 # @description
 # # ModCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'ModCtrl',["$scope", "$routeParams", ($scope, $routeParams) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]
    $scope.slug = $routeParams.slug
    $('.ui.sidebar')
      .sidebar('hide')
    ]
