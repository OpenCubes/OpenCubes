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
    
    Mod.list author: '53e88edbedcfe99201772373', (mods) ->
      $scope.mods = mods
      $scope.$digest()
    
