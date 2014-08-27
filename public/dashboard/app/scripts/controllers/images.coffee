'use strict'

###
 # @ngdoc function
 # @name opencubesDashboardApp.controller:EditmetaCtrl
 # @description
 # # EditmetaCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'ImagesCtrl', ["$scope", "$routeParams", "$rootScope", ($scope, $routeParams, $rootScope) ->
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
    loadData = ->
      Mod.find $routeParams.slug, (err, mod) ->
        $scope.mod =  mod
        if not $scope.$$phase
          $scope.$digest()
    $("div.dropzone").dropzone
      success: (file, result, evt)->
        $.ajax
          type: "PUT"
          url: "//#{config.host}/api/v1/mods/#{$routeParams.slug}"
          data:
            screens: result.data.id
          success: ->
            Mod.invalidate($routeParams.slug)
            loadData()
      paramName: "image"
      method: "post"
      maxFilesize: 2
      url: "https://api.imgur.com/3/upload"
      headers:
        "Authorization": "Client-ID 7924e825500f106"
        "Cache-Control": null
        "X-Requested-With": null
      false
    loadData()
  ]
