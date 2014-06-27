'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:AddmodCtrl
 # @description
 # # AddmodCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'AddmodCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]
