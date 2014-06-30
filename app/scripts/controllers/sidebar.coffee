'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:SidebarCtrl
 # @description
 # # SidebarCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'SidebarCtrl', ($scope) ->
    $scope.mods = [{name: "Loading mods..."}]
    
    $.ajax
      url: "//#{window.config.host}/api/v1/mods?author=537377493f6432ac1d89b6c7"
      dataType: "jsonp"
      success: (data) ->
        $scope.mods = data.mods
        $scope.$digest()
