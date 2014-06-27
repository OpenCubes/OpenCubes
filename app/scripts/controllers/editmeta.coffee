'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:EditmetaCtrl
 # @description
 # # EditmetaCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'EditmetaCtrl', ["$scope", "$routeParams", "$rootScope", ($scope, $routeParams, $rootScope) ->
    $rootScope.navbarSection = "mod"
    $rootScope.navbarHrefPre = "#{$routeParams.slug}/"
    $scope.save = ->
      alert 'save'
      $.ajax
        url: "//#{window.config.host}/api/v1/mods/#{$routeParams.slug}"
        dataType: "json"
        type: "PUT"
        data: $('form').serialize()
        success: (data) ->
          console.log data
        error: console.log
    $.ajax
      url: "//#{window.config.host}/api/v1/mods/#{$routeParams.slug}"
      dataType: "jsonp"
      success: (data) ->
        $scope.mod = data.result
        $scope.$digest()
        showed = false
        $('.ui.dropdown').dropdown().dropdown("set selected", data.result.category)
      ]
