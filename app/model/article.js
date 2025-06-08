'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ArticleSchema = new Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
  });

  // 在保存前更新 updateTime
  ArticleSchema.pre('save', function(next) {
    this.updateTime = Date.now();
    next();
  });

  return mongoose.model('Article', ArticleSchema);
}; 