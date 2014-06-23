'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:ModCtrl
 # @description
 # # ModCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'ModCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]

    $('.ui.sidebar')
      .sidebar('hide')
