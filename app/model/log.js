'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const LogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    module: { type: String, required: true }, // 例如: 'Article', 'User', 'Tag'
    action: { type: String, required: true }, // 例如: 'create', 'update', 'delete', 'batch_delete', 'search'
    entityId: { type: String }, // 被操作实体的ID，如文章ID，用户ID，可选
    details: { type: Schema.Types.Mixed }, // 操作详情，可以是任意类型数据，如修改内容
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
  });

  return mongoose.model('Log', LogSchema);
}; 