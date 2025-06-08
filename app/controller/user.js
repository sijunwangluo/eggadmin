'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx } = this;
    const { keyword, page = 1, pageSize = 5 } = ctx.query;
    const query = {};

    if (keyword) {
      query.$or = [
        { username: new RegExp(keyword, 'i') },
        { email: new RegExp(keyword, 'i') }
      ];
    }

    try {
      // 计算总数
      const total = await ctx.model.User.countDocuments(query);
      
      // 获取分页数据
      const users = await ctx.model.User.find(query)
        .select('-password') // 不返回密码字段
        .sort({ createTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      ctx.body = {
        list: users,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    } catch (error) {
      ctx.logger.error('获取用户列表失败:', error);
      ctx.status = 500;
      ctx.body = { error: '获取用户列表失败' };
    }
  }

  async create() {
    const { ctx } = this;
    const userData = ctx.request.body || {};
    
    // 删除可能存在的id字段
    delete userData.id;
    delete userData._id;
    
    // 验证必填字段
    if (!userData.username || !userData.password || !userData.email) {
      ctx.status = 400;
      ctx.body = { error: '用户名、密码和邮箱为必填项' };
      return;
    }

    // 验证字段格式
    if (userData.username.length < 3 || userData.username.length > 20) {
      ctx.status = 400;
      ctx.body = { error: '用户名长度必须在3-20个字符之间' };
      return;
    }

    if (userData.password.length < 6) {
      ctx.status = 400;
      ctx.body = { error: '密码长度不能小于6位' };
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      ctx.status = 400;
      ctx.body = { error: '邮箱格式不正确' };
      return;
    }

    // 设置默认角色为普通用户
    userData.role = userData.role || 'user';
    
    try {
      // 检查用户名是否已存在
      const existingUser = await ctx.model.User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        ctx.status = 400;
        ctx.body = { error: existingUser.username === userData.username ? '用户名已存在' : '邮箱已存在' };
        return;
      }

      const user = await ctx.model.User.create(userData);
      // 返回用户信息时不包含密码
      const { password, ...userInfo } = user.toObject();
      ctx.body = userInfo;
    } catch (error) {
      ctx.logger.error('创建用户失败:', error);
      if (error.code === 11000) {
        ctx.status = 400;
        ctx.body = { error: '用户名或邮箱已存在' };
      } else {
        ctx.status = 500;
        ctx.body = { error: '创建用户失败: ' + error.message };
      }
    }
  }

  async update() {
    const { ctx } = this;
    const id = ctx.params.id;
    const userData = ctx.request.body || {};
    
    // 不允许更新密码
    delete userData.password;
    
    try {
      // 检查用户是否存在
      const user = await ctx.model.User.findById(id);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: '用户不存在' };
        return;
      }

      // 只检查用户名是否被其他用户使用
      if (userData.username && userData.username !== user.username) {
        const existingUser = await ctx.model.User.findOne({
          username: userData.username,
          _id: { $ne: id } // 排除当前用户
        });
        if (existingUser) {
          ctx.status = 400;
          ctx.body = { error: '用户名已被其他用户使用' };
          return;
        }
      }

      // 更新用户信息
      const updatedUser = await ctx.model.User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true }
      );

      // 返回更新后的用户信息（不包含密码）
      const { password, ...userInfo } = updatedUser.toObject();
      ctx.body = userInfo;
    } catch (error) {
      ctx.logger.error('更新用户失败:', error);
      ctx.status = 500;
      ctx.body = { error: '更新用户失败: ' + error.message };
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

  async initAdmin() {
    const { ctx } = this;
    try {
      // 检查是否已存在管理员账号
      const adminExists = await ctx.model.User.findOne({ role: 'admin' });
      if (adminExists) {
        ctx.body = { message: '管理员账号已存在' };
        return;
      }

      // 创建管理员账号
      const adminData = {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const admin = await ctx.model.User.create(adminData);
      const { password, ...adminInfo } = admin.toObject();
      ctx.body = {
        message: '管理员账号创建成功',
        user: adminInfo
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '创建管理员账号失败' };
    }
  }

  async showUserPage() {
    const { ctx } = this;
    await ctx.render('user.html', {
      active: 'user',
      user: ctx.session.user
    });
  }

  async showUserContentPage() {
    const { ctx } = this;
    await ctx.render('user_content.html');
  }
}

module.exports = UserController; 