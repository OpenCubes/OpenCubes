'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:AboutCtrl
 # @description
 # # AboutCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'AboutCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]
