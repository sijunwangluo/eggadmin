'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {
  async showArticleContentPage() {
    const { ctx } = this;
    await ctx.render('article_content.html');
  }

  async index() {
    const { ctx } = this;
    const { keyword, page = 1, pageSize = 5 } = ctx.query;
    const query = {};

    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        // { 'author.username': new RegExp(keyword, 'i') } // 如果需要通过作者用户名搜索
      ];
    }

    try {
      // 计算总数
      const total = await ctx.model.Article.countDocuments(query);
      
      // 获取分页数据
      const articles = await ctx.model.Article.find(query)
        .populate('author', 'username')
        .sort({ createTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      ctx.body = {
        list: articles,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    } catch (error) {
      ctx.logger.error('获取文章列表失败:', error);
      ctx.status = 500;
      ctx.body = { error: '获取文章列表失败' };
    }
  }

  async create() {
    const { ctx } = this;
    const { title, content, status, tags } = ctx.request.body;
    ctx.logger.info('Request body:', ctx.request.body); // 添加日志，打印请求体数据
    ctx.logger.info('Session user:', ctx.session.user); // 添加日志，打印session中的用户信息
    const author = ctx.session.user ? ctx.session.user.id : null; // 使用id字段

    // 验证必填字段
    if (!title || !content || !status || !author) {
      ctx.status = 400;
      ctx.body = { error: '标题、内容、状态和作者为必填项' };
      return;
    }

    try {
      const article = await ctx.model.Article.create({
        title,
        content,
        author,
        status,
        tags,
      });
      ctx.body = article;
    } catch (error) {
      ctx.logger.error('创建文章失败:', error);
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
        { title, content, status, tags, updateTime: Date.now() },
        { new: true, runValidators: true }
      );

      if (!article) {
        ctx.status = 404;
        ctx.body = { error: '文章不存在' };
        return;
      }
      ctx.body = article;
    } catch (error) {
      ctx.logger.error('更新文章失败:', error);
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
}

module.exports = ArticleController; 