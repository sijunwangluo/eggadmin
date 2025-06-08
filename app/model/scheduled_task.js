'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ScheduledTaskSchema = new Schema({
    name: { type: String, required: true, unique: true }, // 任务名称
    description: { type: String }, // 任务描述
    taskType: { type: String, required: true }, // 任务类型，例如 'clean_logs', 'backup_data'
    intervalSeconds: { type: Number, required: true, min: 5 }, // 执行间隔（秒），最小5秒
    isEnabled: { type: Boolean, default: true }, // 是否启用
    lastRunAt: { type: Date }, // 上次执行时间
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  // 更新时间戳
  ScheduledTaskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
  ScheduledTaskSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
  });

  return mongoose.model('ScheduledTask', ScheduledTaskSchema);
}; 