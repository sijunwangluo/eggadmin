'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ActorSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    avatar: { type: String, trim: true }, // URL to actor's image
    bio: { type: String, trim: true }, // Short biography
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  // Middleware to update `updatedAt` field before saving
  ActorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  ActorSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  return mongoose.model('Actor', ActorSchema);
};