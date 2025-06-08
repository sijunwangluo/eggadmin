'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {
  async showArticleContentPage() {
    const { ctx } = this;
    await ctx.render('article_content.html');
  }

  async index() {
    const { ctx } = this;
    const { keyword = '', page = 1, pageSize = 10 } = ctx.query;
    const query = keyword ? { title: new RegExp(keyword, 'i') } : {};
    try {
      const total = await ctx.model.Article.countDocuments(query);
      const list = await ctx.model.Article.find(query)
        .populate('author', 'username')
        .populate('tags', 'name')
        .sort({ createTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));
      ctx.body = { list, pagination: { total, page: parseInt(page), pageSize: parseInt(pageSize) } };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '获取文章失败' };
    }
  }

  async create() {
    const { ctx } = this;
    const { title, content, status, tags } = ctx.request.body;
    if (!title || !content || !status) {
      ctx.status = 400;
      ctx.body = { error: '标题、内容、状态为必填项' };
      return;
    }
    try {
      const article = await ctx.model.Article.create({
        title,
        content,
        status,
        author: ctx.session.user.id,
        tags: tags || []
      });
      ctx.body = article;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '创建文章失败: ' + error.message };
    }
  }

  async update() {
    const { ctx } = this;
    const id = ctx.params.id;
    const { title, content, status, tags } = ctx.request.body;
    try {
      const article = await ctx.model.Article.findByIdAndUpdate(
        id,
        { title, content, status, tags: tags || [], updateTime: new Date() },
        { new: true, runValidators: true }
      );
      if (!article) {
        ctx.status = 404;
        ctx.body = { error: '文章不存在' };
        return;
      }
      ctx.body = article;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '更新文章失败: ' + error.message };
    }
  }

  async destroy() {
    const { ctx } = this;
    const id = ctx.params.id;

    try {
      const article = await ctx.model.Article.findByIdAndDelete(id);
      if (!article) {
        ctx.status = 404;
        ctx.body = { error: '文章不存在' };
        return;
      }
      ctx.body = { message: '文章删除成功' };
    } catch (error) {
      ctx.logger.error('删除文章失败:', error);
      ctx.status = 500;
      ctx.body = { error: '删除文章失败: ' + error.message };
    }
  }

  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.status = 400;
      ctx.body = { error: '请提供有效的文章ID数组' };
      return;
    }

    try {
      const result = await ctx.model.Article.deleteMany({ _id: { $in: ids } });
      if (result.deletedCount === 0) {
        ctx.status = 404;
        ctx.body = { error: '没有找到要删除的文章' };
        return;
      }
      ctx.body = { message: `成功删除了 ${result.deletedCount} 篇文章` };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '批量删除文章失败: ' + error.message };
    }
  }
}

module.exports = ArticleController; 