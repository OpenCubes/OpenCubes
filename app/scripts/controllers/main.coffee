'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:MainCtrl
 # @description
 # # MainCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'MainCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]
