'use strict';

var mongoose = require('mongoose');

var User = mongoose.model('User');
var codeSchema = mongoose.Schema({
  name: String,
  userId: String,
  script: String,
  score: {type: Number, default: 0}
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  },
  strict: false
});

mongoose.model('Code', codeSchema);

