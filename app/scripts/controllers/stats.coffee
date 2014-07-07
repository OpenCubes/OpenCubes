'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:StatsCtrl
 # @description
 # # StatsCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'StatsCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]
