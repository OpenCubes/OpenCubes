'use strict'

###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:EditversionCtrl
 # @description
 # # EditversionCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'EditversionCtrl', ["$scope", "$routeParams", "$rootScope", ($scope, $routeParams, $rootScope) ->
    $scope.versions = {}
    $rootScope.navbarSection = "mod"
    $('.ui.sidebar').sidebar 'hide'
    $rootScope.navbarHrefPre = "#{$routeParams.slug}/"
    removeQueue = {}
    $scope.delete = (uid, $event) ->
      selector = "[data-uid=#{uid}]"
      $("#{selector} .shape").shape('flip over');
      if not removeQueue[uid]
        removeQueue[uid] = true
        $(selector).animate opacity: 0, 5000, 'linear', ->
          $("#{selector} td").animate 'font-size': '0px', 500
          $("#{selector} .button").remove()

        return
      $(selector).stop()
      $(selector).animate opacity: 1, 7500

      return
    loadVersions = ->
      $.ajax
        url: "//#{window.config.host}/api/v1/versions/#{$routeParams.slug}"
        dataType: "jsonp"
        success: (data) ->
          $scope.versions = data
          forms = {}
          forms[v.name] = {} for v in data
          console.log forms, data
          $scope.forms = forms
          $scope.$digest()
    loadVersions()
    $('.add-version').on 'click', ->
      $el = $ 'input#new-version-name'
      $('.ui.modal').modal
        onApprove: ->
          name = $el.val()
          $.ajax
            url: "//#{window.config.host}/api/v1/versions/#{$routeParams.slug}"
            type: "POST"
            data:
              name: name
            success: ->
              loadVersions()
              $el.val('')
        onDeny: -> $el.val('')
      .modal "show"
    $scope.upload = (version, $event) ->
      $el = $ $event.target
      $el.html '<i class="loading icon"></i> Please wait...'
      vSlug = version.replace('#', '_')
      selector = "#file-#{vSlug.replace(/\./g, '\\.')}"
      $el = $(selector)
      el = $el.get 0
      data = new FormData()
      data.append "file", el.files[0]
      data.append "path", $scope.forms[version].path
      $.ajax
        url: "//#{window.config.host}/api/v1/versions/#{$routeParams.slug}/#{vSlug}"
        type: "POST"
        cache: false
        data: data
        dataType: 'json'
        contentType: false
        processData: false
        error: (data) ->
          $el.addClass "red"
          $el.removeClass "basic"
          $el.html '<i class="frown icon"></i> '+data.statusText
        success: (data) ->
          console.log data
    ]
