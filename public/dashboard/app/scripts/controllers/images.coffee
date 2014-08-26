'use strict'

###*
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
    $("div.dropzone").dropzone
      success: -> console.log arguments
      paramName: "image"
      method: "post"
      maxFilesize: 2
      url: "https://api.imgur.com/3/upload"
      headers:
        "Content-Type": "multipart/form-data"
        "Authorization": "Client-ID 7924e825500f106"
    $('#upload').submit ->
      data = new FormData()
      data.append 'image', $('input[name=file]').get(0).files[0]
      $.ajax
        success: (data) -> console.log data
        type: "POST"
        data:
          image: "http://placehold.it/300x500"
        url: "https://api.imgur.com/3/upload"
        headers:
          Authorization: "Client-ID 7924e825500f106" # Don't forget to put your actual Client-ID here!
      ###
      data =  new FormData()
      data.append 'image', $('input[name=file]').get(0).files[0]
      xhr = new XMLHttpRequest()
      xhr.open('POST', 'https://api.imgur.com/3/upload', true);
      xhr.setRequestHeader('Authorization', "Client-ID 7924e825500f106");

      xhr.send(data);
      ###
      false


    Mod.find $routeParams.slug, (err, mod) ->
      $scope.mod =  mod
      $scope.$digest()
  ]
