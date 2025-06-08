'use strict';

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
      unique: true,
      trim: true,
      lowercase: true
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
      const bcrypt = require('bcryptjs');
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  // 验证密码的方法
  UserSchema.methods.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return mongoose.model('User', UserSchema);
}; 