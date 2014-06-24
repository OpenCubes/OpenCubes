'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:EditdescriptionCtrl
 # @description
 # # EditdescriptionCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'EditdescriptionCtrl', ["$scope", "$routeParams", ($scope, $routeParams) ->
    $.ajax
      url: "//#{window.config.host}/api/v1/mods/#{$routeParams.slug}"
      dataType: "jsonp"
      success: (data) ->
        $scope.mod = data.result
        $scope.$digest()
        converter1 = Markdown.getSanitizingConverter()
        editor1 = new Markdown.Editor converter1
        editor1.run()
      ]
