'use strict';

const Controller = require('egg').Controller;

class TagController extends Controller {
  async index() {
    const { ctx } = this;
    const { keyword = '', page = 1, pageSize = 10 } = ctx.query;
    const query = keyword ? { name: new RegExp(keyword, 'i') } : {};
    try {
      const total = await ctx.model.Tag.countDocuments(query);
      const list = await ctx.model.Tag.find(query)
        .sort({ createTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));
      ctx.body = { list, pagination: { total, page: parseInt(page), pageSize: parseInt(pageSize) } };
      ctx.service.log.record('Tag', 'search', null, { keyword });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '获取标签失败' };
    }
  }

  async create() {
    const { ctx } = this;
    const { name, description } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: '标签名为必填项' };
      return;
    }
    try {
      const tag = await ctx.model.Tag.create({ name, description });
      ctx.body = tag;
      ctx.service.log.record('Tag', 'create', tag._id, { name, description });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '创建标签失败: ' + error.message };
    }
  }

  async update() {
    const { ctx } = this;
    const id = ctx.params.id;
    const { name, description } = ctx.request.body;
    try {
      const oldTag = await ctx.model.Tag.findById(id);
      const tag = await ctx.model.Tag.findByIdAndUpdate(
        id,
        { name, description },
        { new: true, runValidators: true }
      );
      if (!tag) {
        ctx.status = 404;
        ctx.body = { error: '标签不存在' };
        return;
      }
      ctx.body = tag;
      const changes = {};
      if (oldTag.name !== name) changes.name = { old: oldTag.name, new: name };
      if (oldTag.description !== description) changes.description = { old: oldTag.description, new: description };
      ctx.service.log.record('Tag', 'update', tag._id, changes);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '更新标签失败: ' + error.message };
    }
  }

  async destroy() {
    const { ctx } = this;
    const id = ctx.params.id;
    try {
      const tag = await ctx.model.Tag.findByIdAndDelete(id);
      if (!tag) {
        ctx.status = 404;
        ctx.body = { error: '标签不存在' };
        return;
      }
      ctx.body = { message: '标签删除成功' };
      ctx.service.log.record('Tag', 'delete', id, { name: tag.name });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '删除标签失败: ' + error.message };
    }
  }

  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.status = 400;
      ctx.body = { error: '请提供有效的标签ID数组' };
      return;
    }

    try {
      const result = await ctx.model.Tag.deleteMany({ _id: { $in: ids } });
      if (result.deletedCount === 0) {
        ctx.status = 404;
        ctx.body = { error: '没有找到要删除的标签' };
        return;
      }
      ctx.body = { message: `成功删除了 ${result.deletedCount} 个标签` };
      ctx.service.log.record('Tag', 'batch_delete', null, { deletedCount: result.deletedCount, ids });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '批量删除标签失败: ' + error.message };
    }
  }

  async showTagContentPage() {
    const { ctx } = this;
    await ctx.render('tag_content.html');
  }
}

module.exports = TagController; 