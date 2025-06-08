'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx } = this;
    const keyword = ctx.query.keyword || '';
    const query = keyword ? {
      $or: [
        { username: new RegExp(keyword, 'i') },
        { email: new RegExp(keyword, 'i') }
      ]
    } : {};
    
    const users = await ctx.model.User.find(query, { password: 0 });
    ctx.body = users;
  }

  async create() {
    const { ctx } = this;
    const userData = ctx.request.body || {};
    
    // 设置默认角色为普通用户
    userData.role = userData.role || 'user';
    
    try {
      const user = await ctx.model.User.create(userData);
      // 返回用户信息时不包含密码
      const { password, ...userInfo } = user.toObject();
      ctx.body = userInfo;
    } catch (error) {
      if (error.code === 11000) {
        ctx.status = 400;
        ctx.body = { error: '用户名或邮箱已存在' };
      } else {
        ctx.status = 500;
        ctx.body = { error: '创建用户失败' };
      }
    }
  }

  async update() {
    const { ctx } = this;
    const id = ctx.params.id;
    const userData = ctx.request.body || {};
    
    try {
      const user = await ctx.model.User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: '用户不存在' };
        return;
      }
      
      // 返回更新后的用户信息，不包含密码
      const { password, ...userInfo } = user.toObject();
      ctx.body = userInfo;
    } catch (error) {
      if (error.code === 11000) {
        ctx.status = 400;
        ctx.body = { error: '用户名或邮箱已存在' };
      } else {
        ctx.status = 500;
        ctx.body = { error: '更新用户失败' };
      }
    }
  }

  async destroy() {
    const { ctx } = this;
    const id = ctx.params.id;
    
    try {
      const user = await ctx.model.User.findByIdAndDelete(id);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: '用户不存在' };
        return;
      }
      ctx.body = { message: '删除成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '删除用户失败' };
    }
  }
}

module.exports = UserController; 