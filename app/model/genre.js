'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const GenreSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  // Middleware to update `updatedAt` field before saving
  GenreSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  GenreSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  return mongoose.model('Genre', GenreSchema);
};