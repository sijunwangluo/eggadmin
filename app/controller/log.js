'use strict';

const Controller = require('egg').Controller;

class LogController extends Controller {
  async index() {
    const { ctx } = this;
    const { keyword = '', module = '', action = '', page = 1, pageSize = 10 } = ctx.query;

    const query = {};
    if (keyword) {
      query.$or = [
        { username: new RegExp(keyword, 'i') },
        { module: new RegExp(keyword, 'i') },
        { action: new RegExp(keyword, 'i') },
        { entityId: new RegExp(keyword, 'i') }
      ];
    }
    if (module) {
      query.module = module;
    }
    if (action) {
      query.action = action;
    }

    try {
      const total = await ctx.model.Log.countDocuments(query);
      const list = await ctx.model.Log.find(query)
        .populate('userId', 'username') // 填充用户信息
        .sort({ timestamp: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      ctx.body = { list, pagination: { total, page: parseInt(page), pageSize: parseInt(pageSize) } };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '获取日志失败' };
      ctx.logger.error('获取日志失败:', error);
    }
  }

  async showLogContentPage() {
    const { ctx } = this;
    await ctx.render('log_content.html');
  }
}

module.exports = LogController; 