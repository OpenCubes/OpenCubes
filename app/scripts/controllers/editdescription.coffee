'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:EditdescriptionCtrl
 # @description
 # # EditdescriptionCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'EditdescriptionCtrl', ["$scope", "$routeParams", "$rootScope", ($scope, $routeParams, $rootScope) ->
    $rootScope.navbarSection = "mod"
    $rootScope.navbarHrefPre = "#{$routeParams.slug}/"
    $scope.save = ->
      $.ajax
        url: "//#{window.config.host}/api/v1/mods/#{$routeParams.slug}"
        dataType: "json"
        type: "PUT"
        data:
          body: $('textarea#wmd-input').val()
        success: (data) ->
          console.log data
    $.ajax
      url: "//#{window.config.host}/api/v1/mods/#{$routeParams.slug}"
      dataType: "jsonp"
      success: (data) ->
        $scope.mod = data.result
        $scope.$digest()
        converter1 = Markdown.getSanitizingConverter()
        editor1 = new Markdown.Editor converter1
        editor1.run()
        showed = false
        $('textarea#wmd-input').on 'input', ->
          if not showed
            $('.ui.top.sidebar')
            .sidebar
              overlay: true
            .sidebar 'show'
      ]
