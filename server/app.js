'use strict';

var express = require('express');
var http = require('http');

var mongoose = require('mongoose');
mongoose.connect('localhost', 'aiscript_development');
// Models
require('./models/user');
require('./models/code');


var User = mongoose.model('User');

var app = express();

var routes = require('./routes');
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.cookieSession({ secret: 'keyboard cat' }));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

var auth = function (req, res, next) {
  if (!req.session.token) {
    res.json(401, {});
  } else {
    User.findOne({token: req.session.token}, function (err, user) {
      if (!err && user) {
        req.user = user;
        next();
      } else {
        res.json(401, {});
      }
    });
  }
};

app.get('/', routes.index);
app.post('/logout', routes.logout);
app.post('/register', routes.register);
app.get('/session', auth, routes.session);
app.get('/code', routes.getCodes);
app.post('/code', auth, routes.newCode);
app.get('/code/:codeId', auth, routes.codeInfo);
app.delete('/code/:codeId', auth, routes.deleteCode);
app.post('/token', routes.postToken);

if (module && module.exports) {
  module.exports = app;
} else {
  http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
}
