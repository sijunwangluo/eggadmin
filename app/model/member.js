'use strict';

const bcrypt = require('bcryptjs');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const MemberSchema = new Schema({
    account: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true }, // sparse允许null或undefined唯一
    name: { type: String, required: true, trim: true },
    idCardNumber: { type: String, unique: true, sparse: true, trim: true },
    walletBalance: { type: Number, default: 0, min: 0 },
    points: { type: Number, default: 0, min: 0 },
    registrationTime: { type: Date, default: Date.now },
    ipAddress: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now }
  });

  // 保存前处理密码（哈希）
  MemberSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        return next(error);
      }
    }
    next();
  });

  // 更新前更新 updateTime
  MemberSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updateTime: Date.now() });
    next();
  });

  // 验证密码的方法
  MemberSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  };

  return mongoose.model('Member', MemberSchema);
}; 