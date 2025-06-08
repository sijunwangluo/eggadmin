'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TagSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    createTime: { type: Date, default: Date.now }
  });

  return mongoose.model('Tag', TagSchema);
}; 