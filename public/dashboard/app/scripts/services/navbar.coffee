'use strict'

###*
 # @ngdoc service
 # @name opencubesDashboardApp.Navbar
 # @description
 # # Navbar
 # Service in the opencubesDashboardApp.
###
angular.module('opencubesDashboardApp')
  .service 'Navbar', ->
    navbarItems =
      default:
        left:[
          text: "Upload a new mod"
          icon: "upload icon"
          href: "upload"
        ]
      mod:
        left: [
          text: "Overview"
          href: ""
          icon: "browser icon"
        ,
          text: "Statitics"
          href: "stats"
          icon: "signal icon"
        ,
          text: "Edit meta"
          href: "edit/meta"
          icon: "info letter icon"
        ,
          text: "Edit description"
          href: "edit/body"
          icon: "edit sign icon"
        ,
          text: "Manage files & versions"
          href: "edit/versions"
          icon: "archive icon"
        ,
          text: "Images"
          href: "images"
          icon: "photo icon"
        ]
        right: [
          text: "Actions"
          href: "edit/do"
          icon: "ellipsis vertical icon"
        ]
    # AngularJS will instantiate a singleton by calling "new" on this function
