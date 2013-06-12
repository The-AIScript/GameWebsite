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
  .factory('Game', ['$rootScope', function ($rootScope) {
    var _map;
    var _timer;
    var _finishCallback;
    return {
      loadMap: function (map) {
        _map = map;
        return this;
      },
      finish: function (finish) {
        _finishCallback = finish;
        return this;
      },
      play: function (interval, callback) {
        var elements;
        if (!_map) {
          return false;
        }
        // LoadMap...
        var mapInfo = _map[0];
        if (!mapInfo.map) {
          return callback(new Error('No map info'));
        }

        elements = {};
        // Map Size
        elements.mapSize = {
          width: mapInfo.width * 16,
          height: mapInfo.height * 16,
          top: (940 - mapInfo.height * 16) / 2
        };

        elements.round = 0;
        elements.walls = mapInfo.map.split('').map(function (block, index) {
          var left = index % mapInfo.width * 16 - 5;
          var top = (index / mapInfo.width | 0) * 16 - 5;
          return {left: left, top: top, block: block};
        }).filter(function (block) {
          return block.block === '#';
        });

        callback(null, elements, false);

        var round = 1;
        _timer = setInterval(function () {
          elements = {};
          elements.round = round++;
          var map = _map[elements.round];
          if (!map) {
            // Game is end
            clearInterval(_timer);
            if (typeof _finishCallback === 'function') {
              _finishCallback(elements);
            }
            return;
          }

          // Update wall
          if (map.map) {
            elements.walls = map.map.split('').map(function (block, index) {
              var left = index % mapInfo.width * 16 - 5;
              var top = (index / mapInfo.width | 0) * 16 - 5;
              return {left: left, top: top, block: block};
            }).filter(function (block) {
              return block.block === '#';
            });
          }

          // Food data
          elements.foods = map.foods.map(function (food) {
            var left = (food[0] - 1) * 16 - 4;
            var top = (food[1] - 1) * 16 - 1;
            return {left: left, top: top};
          });

          // Snake
          elements.bodys = [];
          elements.heads = [];
          elements.tails = [];
          elements.corners = [];
          map.snakes.forEach(function (snake, playerIndex) {
            var points = snake.position.reverse().map(function (point) {
              return {
                x: point[0],
                y: point[1]
              };
            });
            var lastTwoPoint = [];
            var directionLast, directionCurrent;
            points.forEach(function (point) {
              if (lastTwoPoint.length === 0) {
                lastTwoPoint.unshift(point);
                return;
              }
              if (lastTwoPoint.length === 1) {
                lastTwoPoint[0].type = 'tail';
                lastTwoPoint[0].direction = [point.x - lastTwoPoint[0].x, point.y - lastTwoPoint[0].y];
                directionCurrent = [point.x - lastTwoPoint[0].x, point.y - lastTwoPoint[0].y];
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
            if (directionCurrent) {
              lastTwoPoint[0].direction = directionCurrent;
            } else if (snake.heading === 0) {
              lastTwoPoint[0].direction = [0, -1];
            } else if (snake.heading === 1) {
              lastTwoPoint[0].direction = [1, -1];
            } else if (snake.heading === 2) {
              lastTwoPoint[0].direction = [0, 1];
            } else if (snake.heading === 3) {
              lastTwoPoint[0].direction = [-1, 0];
            }

            elements.bodys = (elements.bodys || []).concat(points.filter(function (point) {
              if (point.type === 'body') {
                point.left = (point.x - 1) * 16;
                point.top = (point.y - 1) * 16;
                if (point.direction[1] === 0) {
                  point['-webkit-transform'] = 'rotate(90deg)';
                }
                if (playerIndex) {
                  point['-webkit-filter'] = 'hue-rotate(' + (360 / mapInfo.snakes.length * playerIndex) + 'deg)';
                }
                return true;
              }
              return false;
            }));

            elements.corners = (elements.corners || []).concat(points.filter(function (point) {
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
                if (playerIndex) {
                  point['-webkit-filter'] = 'hue-rotate(' + (360 / mapInfo.snakes.length * playerIndex) + 'deg)';
                }
                return true;
              }
              return false;
            }));

            elements.heads = (elements.heads || []).concat(points.filter(function (point) {
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
                if (playerIndex) {
                  point['-webkit-filter'] = 'hue-rotate(' + (360 / mapInfo.snakes.length * playerIndex) + 'deg)';
                }
                return true;
              }
              return false;
            }));

            elements.tails = (elements.tails || []).concat(points.filter(function (point) {
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
                if (playerIndex) {
                  point['-webkit-filter'] = 'hue-rotate(' + (360 / mapInfo.snakes.length * playerIndex) + 'deg)';
                }
                return true;
              }
              return false;
            }));
          });
          callback(null, elements, true);
        }, interval);
        return true;
      }
    };
  }])
  .value('githubClientID', '431fb09dec02503995d9');
