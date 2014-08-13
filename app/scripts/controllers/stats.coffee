'use strict'
stars = (date, slug) ->
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
        }]
    return

  return
render = (date, slug) ->
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
          categories: data.result.labels.map (d) -> if d % 2 is 1 then d + ":00" else ""
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
  .controller 'StatsCtrl', ($scope, $routeParams) ->
    render new Date(Date.now() - 1000 * 3600 * 24 * 10), $routeParams.slug
    stars new Date(Date.now() - 1000 * 3600 * 24 * 10), $routeParams.slug
