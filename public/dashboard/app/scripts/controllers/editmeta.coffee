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
      if not $scope.mod.isDirty()
        return
      $scope.mod.save ->
        $('.ui.submit.button').addClass('green')
        .removeClass('blue')
        .addClass('disabled')
        .html('Saved')
    Mod.find $routeParams.slug, (err, mod) ->
      $scope.mod =  mod
      $scope.$digest()
      showed = false
      $('.ui.dropdown').dropdown().dropdown("set selected", mod.category)
      $el =  $('textarea[name=summary]')
      $dd = $('input[name=category]')
      $dd.on 'change', -> 
        $scope.mod.set "category", $dd.val()
        $(".ui.blue.submit.button.disabled").removeClass "disabled"
      $el.on 'input',  ->
        $scope.mod.set "summary", $el.val()
        $(".ui.blue.submit.button.disabled").removeClass "disabled"
    ]
