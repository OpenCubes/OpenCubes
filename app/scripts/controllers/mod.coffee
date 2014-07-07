'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:ModCtrl
 # @description
 # # ModCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'ModCtrl',["$scope", "$routeParams", "$rootScope", ($scope, $routeParams, $rootScope) ->
    $rootScope.navbarSection = "mod"
    $rootScope.navbarHrefPre = "#{$routeParams.slug}/"
    $scope.slug = $routeParams.slug
    $('.ui.sidebar')
      .sidebar('hide')
    ]
