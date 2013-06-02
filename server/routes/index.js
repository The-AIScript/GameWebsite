'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Code = mongoose.model('Code');
var async = require('async');

var request = require('request');

exports.index = function (req, res) {
  res.json({});
};

exports.logout = function (req, res) {
  delete req.session.token;
  res.json({});
};

exports.register = function (req, res) {
  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save();
  res.json({});
};

exports.session = function (req, res) {
  res.json(req.user);
};

exports.postToken = function (req, res) {
  request.post({
    uri: 'https://github.com/login/oauth/access_token',
    json: {
      client_secret: '55c59d148f00d6f57f9aafe015c746a17410c87d',
      client_id: req.body.client_id,
      code: req.body.code
    }
  }, function (e, rsp, body) {
    var token = body.access_token;
    User.findOne({token: token}, function (err, user) {
      if (user) {
        res.json(user);
      }
      request.get({
        uri: 'https://api.github.com/user?access_token=' + token,
        headers: {
          'User-agent': 'Ai Script'
        },
        json: true
      }, function (e, rsp, profile) {
        var userExists = true;
        if (!user) {
          userExists = false;
          user = new User();
          user.token = token;
        }
        user.name = profile.name;
        user.email = profile.email;
        user.github = profile.html_url;
        user.avatar = profile.avatar_url;
        user.save();
        if (!userExists) {
          res.json(user);
        }
      });
    });
    req.session.token = token;
  });
};

exports.getCodes = function (req, res) {
  if (req.query.user) {
    Code.find({userId: req.query.user}, function (err, codes) {
      res.json({codes: codes});
    });
  } else if (req.query.rank) {
    Code.find({}).sort('score').exec(function (err, codes) {
      async.map(codes, function (item, callback) {
        item = item.toObject();
        User.findById(item.userId, function (err, user) {
          item.user = user;
          callback(null, item);
        });
      }, function (err, codes) {
        res.json({codes: codes});
      });
    });
  } else {
    res.json(400, {});
  }
};

exports.newCode = function (req, res) {
  console.log(req.body);
  var code = new Code({
    name: req.body.name,
    userId: req.body.userId,
    script: req.body.script
  });
  code.save();
  res.json({});
};

exports.codeInfo = function (req, res) {
  Code.findById(req.params.codeId, function (err, code) {
    res.json(code);
  });
};

exports.deleteCode = function (req, res) {
  Code.findByIdAndRemove(req.params.codeId, function () {
    res.json({});
  });
};
