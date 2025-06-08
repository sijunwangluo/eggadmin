'use strict';

const Controller = require('egg').Controller;

class MemberController extends Controller {
  // 获取会员列表
  async index() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, keyword = '' } = ctx.query;
    
    const query = {};
    if (keyword) {
      query.$or = [
        { account: new RegExp(keyword, 'i') },
        { name: new RegExp(keyword, 'i') },
        { phone: new RegExp(keyword, 'i') },
        { email: new RegExp(keyword, 'i') }
      ];
    }

    try {
      const total = await ctx.model.Member.countDocuments(query);
      const list = await ctx.model.Member.find(query)
        .sort({ registrationTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      await ctx.service.log.record('Member', 'search', null, { keyword, page, pageSize });

      ctx.body = {
        success: true,
        data: {
          list,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    } catch (error) {
      ctx.logger.error('获取会员列表失败: %s', error.message);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取会员列表失败'
      };
    }
  }

  // 创建会员
  async create() {
    const { ctx } = this;
    const memberData = ctx.request.body;
    
    try {
      // 确保密码被哈希，模型pre save hook会处理
      const member = new ctx.model.Member(memberData);
      await member.save();
      
      await ctx.service.log.record('Member', 'create', member._id, memberData);

      ctx.body = {
        success: true,
        data: member
      };
    } catch (error) {
      ctx.logger.error('创建会员失败: %s', error.message);
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  // 更新会员
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const memberData = ctx.request.body;
    
    try {
      const member = await ctx.model.Member.findById(id);
      if (!member) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '会员不存在'
        };
        return;
      }

      // 更新字段，跳过密码更新除非明确提供新密码
      Object.assign(member, memberData);
      if (memberData.password) {
        member.password = memberData.password; // pre save hook 会重新哈希
      }
      await member.save();

      await ctx.service.log.record('Member', 'update', member._id, memberData);

      ctx.body = {
        success: true,
        data: member
      };
    } catch (error) {
      ctx.logger.error('更新会员失败: %s', error.message);
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  // 删除会员
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      const member = await ctx.model.Member.findByIdAndDelete(id);
      
      if (!member) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '会员不存在'
        };
        return;
      }

      await ctx.service.log.record('Member', 'delete', id, { name: member.name, account: member.account });

      ctx.body = {
        success: true,
        message: '删除成功'
      };
    } catch (error) {
      ctx.logger.error('删除会员失败: %s', error.message);
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  // 批量删除会员
  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请提供有效的会员ID列表'
      };
      return;
    }

    try {
      const result = await ctx.model.Member.deleteMany({ _id: { $in: ids } });

      for (const id of ids) {
        await ctx.service.log.record('Member', 'batch_delete', id, { message: '批量删除' });
      }

      ctx.body = {
        success: true,
        message: `成功删除 ${result.deletedCount} 个会员`
      };
    } catch (error) {
      ctx.logger.error('批量删除会员失败: %s', error.message);
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  // 渲染会员管理页面
  async showMemberContentPage() {
    await this.ctx.render('member_content.html');
  }
}

module.exports = MemberController; 