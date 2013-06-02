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
  .controller('StartCtrl', function ($scope, $rootScope, $http, User) {
    var mapInfo = {"name":"wall","version":"1.0","height":50,"width":50,"snake":2,"food":2,"mapData":"............................................................................................................................................................................................................................................................................................................................................................................................................................................................................##############################....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#....................#............................#..............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................","snakes":[{"position":[[3,2],[3,1],[2,1],[1,1],[1,2],[1,3],[2,3],[2,4],[3,4],[3,3],[4,3],[5,3],[6,3],[6,4],[5,4]]},{"heading":[-1,0],"position":[[49,50],[50,50]],"length":2}],"foods":[[15,20],[8,36]]};

    // Wall data
    $scope.walls = mapInfo.mapData.split('').map(function (block, index) {
      index = index + 1;
      var left = index % mapInfo.width * 16 - 5;
      var top = (index / mapInfo.width | 0) * 16 - 5;
      return {left: left, top: top, block: block};
    }).filter(function (block) {
      return block.block === '#';
    });

    // Food data
    $scope.foods = mapInfo.foods.map(function (food) {
      var left = (food[0] - 1) * 16 - 4;
      var top = (food[1] - 1) * 16 - 1;
      return {left: left, top: top};
    });

    // Map Size
    $scope.mapSize = {width: mapInfo.width * 16, height: mapInfo.height * 16};
    $http.get('/api/code?rank=true').success(function (data) {
      $scope.codes = data.codes;
    });

    // Snake
    var snake = mapInfo.snakes[0].position.map(function (point) {
      return {
        x: point[0],
        y: point[1]
      };
    });
    var lastTwoPoint = [];
    var directionLast, directionCurrent;
    snake.forEach(function (point) {
      if (lastTwoPoint.length === 0) {
        lastTwoPoint.unshift(point);
        return;
      }
      if (lastTwoPoint.length === 1) {
        lastTwoPoint[0].type = 'tail';
        lastTwoPoint[0].direction = [point.x - lastTwoPoint[0].x, point.y - lastTwoPoint[0].y];
        lastTwoPoint.unshift(point);
        return;
      }
      directionLast = [lastTwoPoint[0].x - lastTwoPoint[1].x, lastTwoPoint[0].y - lastTwoPoint[1].y];
      directionCurrent = [point.x - lastTwoPoint[0].x, point.y - lastTwoPoint[0].y];
      var direction = [directionCurrent[0] - directionLast[0], directionCurrent[1] - directionLast[1]];
      if (direction[0] === 0 && direction[1] === 0) {
        lastTwoPoint[0].type = 'body';
        lastTwoPoint[0].direction = directionCurrent;
      } else {
        lastTwoPoint[0].type = 'corner';
        lastTwoPoint[0].direction = direction;
      }
      lastTwoPoint.unshift(point);
    });
    lastTwoPoint[0].type = 'head';
    lastTwoPoint[0].direction = directionCurrent;

    $scope.bodys = snake.filter(function (point) {
      if (point.type === 'body') {
        point.left = (point.x - 1) * 16;
        point.top = (point.y - 1) * 16;
        if (point.direction[1] === 0) {
          point['-webkit-transform'] = 'rotate(90deg)';
        }
        //point['-webkit-filter'] = 'hue-rotate(60deg)';
        return true;
      }
      return false;
    });

    $scope.corners = snake.filter(function (point) {
      if (point.type === 'corner') {
        point.left = (point.x - 1) * 16;
        point.top = (point.y - 1) * 16;
        if (point.direction[0] === 1 && point.direction[1] === -1) {
          point['-webkit-transform'] = 'rotate(270deg)';
        } else if (point.direction[0] === -1 && point.direction[1] === 1) {
          point['-webkit-transform'] = 'rotate(90deg)';
        } else if (point.direction[0] === -1 && point.direction[1] === -1) {
          point['-webkit-transform'] = 'rotate(180deg)';
        }
        return true;
      }
      return false;
    });

    $scope.heads = snake.filter(function (point) {
      if (point.type === 'head') {
        point.left = (point.x - 1) * 16;
        point.top = (point.y - 1) * 16;
        if (point.direction[0] === 0 && point.direction[1] === 1) {
          point['-webkit-transform'] = 'rotate(90deg)';
        } else if (point.direction[0] === 0 && point.direction[1] === -1) {
          point['-webkit-transform'] = 'rotate(270deg)';
        } else if (point.direction[0] === -1 && point.direction[1] === 0) {
          point['-webkit-transform'] = 'rotate(180deg)';
        }
        return true;
      }
      return false;
    });

    $scope.tails = snake.filter(function (point) {
      if (point.type === 'tail') {
        point.left = (point.x - 1) * 16;
        point.top = (point.y - 1) * 16;
        if (point.direction[0] === 0 && point.direction[1] === 1) {
          point['-webkit-transform'] = 'rotate(90deg)';
        } else if (point.direction[0] === 0 && point.direction[1] === -1) {
          point['-webkit-transform'] = 'rotate(270deg)';
        } else if (point.direction[0] === -1 && point.direction[1] === 0) {
          point['-webkit-transform'] = 'rotate(180deg)';
        }
        return true;
      }
      return false;
    });

    $scope.start = function () {
      var players = $scope.codes.filter(function (code) {
        return code.checked;
      });
      console.log(players);
    };
  })
  .controller('AboutCtrl', function ($scope, $rootScope, $http) {
    $rootScope.page = 'about';
  })
  .controller('SubmitCtrl', function ($scope, $rootScope, User, $http, $location) {
    $rootScope.page = 'submit';
    $scope.btn = 'Submit';
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

