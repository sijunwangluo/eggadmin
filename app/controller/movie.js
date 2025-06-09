'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
  async index() {
    const { ctx } = this;
    const { page = 1, limit = 10, title, director, genre } = ctx.query;
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' }; // 模糊查询标题
    if (director) query.director = { $regex: director, $options: 'i' }; // 模糊查询导演
    if (genre) query.genre = genre; // 精确查询类型

    const movies = await ctx.model.Movie.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await ctx.model.Movie.countDocuments(query);
    ctx.body = { success: true, data: movies, total };
  }

  async create() {
    const { ctx } = this;
    const movie = new ctx.model.Movie(ctx.request.body);
    await movie.save();
    ctx.body = { success: true, data: movie };
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const movie = await ctx.model.Movie.findByIdAndUpdate(id, ctx.request.body, { new: true });
    if (!movie) {
      ctx.body = { success: false, message: '电影不存在' };
      return;
    }
    ctx.body = { success: true, data: movie };
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const movie = await ctx.model.Movie.findByIdAndDelete(id);
    if (!movie) {
      ctx.body = { success: false, message: '电影不存在' };
      return;
    }
    ctx.body = { success: true, message: '删除成功' };
  }

  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body; // ids 是一个包含多个 id 的数组
    const result = await ctx.model.Movie.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount > 0) {
      ctx.body = { success: true, message: `成功删除 ${result.deletedCount} 条记录` };
    } else {
      ctx.body = { success: false, message: '没有找到要删除的记录' };
    }
  }

  async showMovieContentPage() {
    const { ctx } = this;
    await ctx.render('movie_content.html');
  }
}

module.exports = MovieController;