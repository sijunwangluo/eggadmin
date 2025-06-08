'use strict';

const bcrypt = require('bcryptjs');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    email: { 
      type: String, 
      required: true,
      trim: true
    },
    role: { 
      type: String, 
      enum: ['admin', 'user'], 
      default: 'user' 
    },
    createTime: { 
      type: Date, 
      default: Date.now 
    }
  });

  // 保存前处理密码
  UserSchema.pre('save', async function(next) {
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

  // 验证密码的方法
  UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  };

  return mongoose.model('User', UserSchema);
}; 