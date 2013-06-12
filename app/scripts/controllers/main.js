'use strict';
/*global angular, $, alert */

angular.module('gradulateProductionControllers', ['gradulateProductionServices'])
  .run(function ($rootScope, $location, $http, githubClientID, User) {
    $rootScope.$on('event:auth-loginRequired', function () {
      alert('Auth required.');
    });

    $http.get('/api/session', {ignoreAuthModule: true}).success(function (user) {
      User.login(user);
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
      $rootScope.loading = 'normal';
      if (current.$$route.title !== '') {
        $rootScope.title = current.$$route.title;
      }
    });

    if ($location.search().code) {
      $rootScope.loadingUser = true;
      $http.post('/api/token', {
        client_id: githubClientID,
        code: $location.search().code
      }).success(function (data) {
        $rootScope.user = data;
        User.login(data);
        $rootScope.loadingUser = false;
      });
      $location.search({});
    }
  })
  .controller('NavCtrl', function ($scope, $http, $rootScope, githubClientID, $location, User) {
    $scope.githubClientID = githubClientID;
    $scope.location = $location;
    $scope.user = User.get();
    $scope.logout = function () {
      $http.post('/api/logout');
      User.logout();
    };
  })
  .controller('MainCtrl', function ($scope, $http, $location, $rootScope, githubClientID) {
    $rootScope.page = 'home';
  })
  .controller('GameCtrl', function ($scope, $rootScope, $http, User) {
    $rootScope.page = 'game';
    function getUserCodes() {
      if ($scope.user.name) {
        $http.get('/api/code?user=' + $scope.user.id).success(function (data) {
          $scope.myCodes = data.codes;
        });
      }
    }
    $scope.user = User.get();
    $scope.$on('event:login', function () {
      getUserCodes();
    });
    getUserCodes();
    $http.get('/api/code?rank=true').success(function (data) {
      $scope.rankCodes = data.codes;
    });

  })
  .controller('StartCtrl', function ($scope, $rootScope, $http, User, Game) {
    $http.get('/api/code?rank=true').success(function (data) {
      $scope.codes = data.codes;
      console.log(data);
    });

    Game.loadMap(mapData)
        .finish(function () {
          $scope.$apply();
        })
        .play(100, function (error, elements, isTimerEvent) {
      var index;
      for (index in elements) {
        if (elements.hasOwnProperty(index)) {
          $scope[index] = elements[index];
        }
      }
      if (isTimerEvent) {
        $scope.$apply();
      }
    });

    $scope.start = function () {
      var players = $scope.codes.filter(function (code) {
        return code.checked;
      });
    };

    $scope.click = function (code) {
      code.checked = !code.checked;
    };
  })
  .controller('AboutCtrl', function ($scope, $rootScope, $http) {
    $rootScope.page = 'about';
  })
  .controller('SubmitCtrl', function ($scope, $rootScope, User, $http, $location) {
    $rootScope.page = 'submit';
    $scope.btn = 'Submit';
    $scope.script = '// config: map info\r\n// callback: callback function';
    $scope.submit = function () {
      $http.post('/api/code', {
        name: $scope.name,
        script: $scope.script,
        userId: User.get().id
      }).success(function () {
        $location.path('/game');
      });
      $scope.btn = 'Submiting...';
    };
  })
  .controller('ProfileCtrl', function ($scope, $rootScope, User) {
    $rootScope.page = 'profile';
    $scope.user = User.get();
  })
  .controller('CodeCtrl', function ($scope, $rootScope, User, $http, $routeParams, $location) {
    $rootScope.page = 'profile';
    $scope.btn = 'Delete';
    $http.get('/api/code/' + $routeParams.id).success(function (data) {
      $scope.code = data;
    });
    $scope.user = User.get();
    $scope.delete = function () {
      $http.delete('/api/code/' + $routeParams.id).success(function (data) {
        $location.path('/game');
      });
      $scope.btn = 'Deleting...';
    };
  });

