'use strict';

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  token: {type: String, trim: true, require: true,
           index: {unique: true, dropDups: true} },
  name: String,
  email: String,
  github: String,
  avatar: String
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.token;
      ret.id = ret._id;
      delete ret._id;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.token;
      ret.id = ret._id;
      delete ret._id;
    }
  }

});

mongoose.model('User', userSchema);

