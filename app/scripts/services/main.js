'use strict';
/*global angular */

angular.module('gradulateProductionServices', [])
  .factory('User', ['$http', '$rootScope', function ($http, $rootScope) {
    var user = {};
    return {
      get: function () {
        return user;
      },
      login: function (info) {
        var property;
        for (property in info) {
          if (info.hasOwnProperty(property)) {
            user[property] = info[property];
          }
        }
        $rootScope.$broadcast('event:login');
      },
      logout: function () {
        var property;
        for (property in user) {
          if (user.hasOwnProperty(property)) {
            delete user[property];
          }
        }
        $rootScope.$broadcast('event:logout');
      }
    };
  }])
  .factory('Game', function () {
    return {};
  })
  .value('githubClientID', '431fb09dec02503995d9');
