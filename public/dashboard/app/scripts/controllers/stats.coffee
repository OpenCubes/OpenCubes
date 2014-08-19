'use strict'
renderStars = (date, slug) ->
  if date
    ts = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
  else
    ts = "daily"
  i = 0
  $.ajax(
    url: "https://opencubes-c9-vinz243.c9.io/api/v1/stats/#{slug}/stars/day"
    dataType: "jsonp"
  ).done (data) ->
      $('#chart-stars').highcharts
        chart: {
          type: 'column'
        },
        title: {
          text: 'Monthly stars'
        },
        xAxis: {
          categories: data.result.labels
          labels: {
            formatter: ->
               d = /(\d+)-(\d+)-(\d+)/.exec(@value)[3]
               if d % 2 is 0 then return d
               ""
          }
        },
        yAxis: {
          title:{
            text: 'Stars earned'
          }
        },
        series: [{
          name: 'Your mod',
          data: data.result.data
        }],
        credits: enabled: false
    return

  return
renderAdv = (slug) ->
  viewsURL = "https://opencubes-c9-vinz243.c9.io/api/v1/stats/#{slug}/views/daily"
  starsURL = "https://opencubes-c9-vinz243.c9.io/api/v1/stats/#{slug}/stars/all"
  viewsData = {}
  starsData = {}
  views = []
  stars = []
  $.when($.ajax(
    url: viewsURL,
    dataType: "jsonp",
    success: (data) -> viewsData = data
  ), $.ajax( 
    url: starsURL,
    dataType: "jsonp",
    success: (data) -> starsData = data
  )).then () ->
    viewsObj = _.object viewsData.result.labels, viewsData.result.data
    starsObj = _.object starsData.result.labels, starsData.result.data
    labels = []
    if viewsData.result.labels.length > starsData.result.labels.length
      labels = viewsData.result.labels
      for date in viewsData.result.labels
        views.push viewsObj[date] or 0
        stars.push starsObj[date] or 0
    else
      labels = starsData.result.labels
      for date in starsData.result.labels
        views.push viewsObj[date] or 0
        stars.push starsObj[date] or 0
    $('#chart-big').highcharts
        chart: {
          type: 'line',
          zoomType: 'xy'
        },
        tooltip: {
            shared: true
        },
        title: {
          text: 'Views and stars all time'
        },
        xAxis: {
          categories: labels
          labels:
            formatter: ->
              i = (/(\d+)-(\d+)-(\d+)/.exec(@value)[3] - 0)
              if i is 1
                return @value
              else
                return " "
              
        },
        yAxis: {
          title:{
            text: 'Hits'
          }
        },
        series: [{
          name: 'Views',
          data: views
        },{
          name: 'Stars',
          data: stars,
          type: 'column'
        }]
renderViews = (date, slug) ->
  if date
    ts = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
  else
    ts = "daily"
  $.ajax(
    url: "https://opencubes-c9-vinz243.c9.io/api/v1/stats/#{slug}/views/" + ts
    dataType: "jsonp"
  ).done (data) ->
       $('#chart-views').highcharts
        chart: {
          type: 'line'
        },
        title: {
          text: 'Views today'
        },
        xAxis: {
          categories: data.result.labels.map (d) -> d+ ":00"
          formatter: ->
            d = @value
            if /(\d+):00/.exec(d)[1] % 2 is 1 
              return d
            ""
        },
        yAxis: {
          title:{
            text: 'Views'
          }
        },
        series: [{
          name: 'Your mod',
          data: data.result.data
        }]
        credits: enabled: false
    return

  return
###*
 # @ngdoc function
 # @name opencubesDashboardApp.controller:StatsCtrl
 # @description
 # # StatsCtrl
 # Controller of the opencubesDashboardApp
###
angular.module('opencubesDashboardApp')
  .controller 'StatsCtrl',  ["$scope", "$routeParams", "$rootScope", ($scope, $routeParams, $rootScope) ->
    $rootScope.navbarSection = "mod"
    $rootScope.navbarHrefPre = "#{$routeParams.slug}/"
    renderViews new Date(Date.now() - 1000 * 3600 * 24 * 10), $routeParams.slug
    renderStars new Date(Date.now() - 1000 * 3600 * 24 * 10), $routeParams.slug
    renderAdv $routeParams.slug
  ]
