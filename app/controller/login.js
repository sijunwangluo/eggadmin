'use strict';

const Controller = require('egg').Controller;

class LoginController extends Controller {
  async index() {
    await this.ctx.render('login.html');
  }

  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    try {
      const user = await ctx.model.User.findOne({ username });
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { error: '用户名或密码错误' };
        return;
      }

      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        ctx.status = 401;
        ctx.body = { error: '用户名或密码错误' };
        return;
      }

      // 设置session
      ctx.session.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };

      ctx.body = { 
        success: true,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '登录失败' };
    }
  }

  async logout() {
    const { ctx } = this;
    ctx.session = null;
    ctx.body = { success: true };
  }
}

module.exports = LoginController; 