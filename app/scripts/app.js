'use strict';
/*global angular */

angular.module('gradulateProductionApp', ['gradulateProductionControllers', 'http-auth-interceptor'])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        title: 'Home',
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/game', {
        title: 'Game Center',
        templateUrl: '/views/game.html',
        controller: 'GameCtrl'
      })
      .when('/start', {
        title: 'Start a new game',
        templateUrl: '/views/start.html',
        controller: 'StartCtrl'
      })
      .when('/dashboard', {
        title: 'Dashboard',
        templateUrl: '/views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/profile', {
        title: 'Profile',
        templateUrl: '/views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/about', {
        title: 'About',
        templateUrl: '/views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/submit', {
        title: 'Submit Code',
        templateUrl: '/views/submit.html',
        controller: 'SubmitCtrl'
      })
      .when('/code/:id', {
        title: 'View code',
        templateUrl: '/views/code.html',
        controller: 'CodeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true).hashPrefix('!');
  });
