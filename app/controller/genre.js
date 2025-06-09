'use strict';

const Controller = require('egg').Controller;

class GenreController extends Controller {
  // GET /api/genres - 获取所有类型 (分页)
  async index() {
    const { ctx } = this;
    const { page = 1, limit = 10, name } = ctx.query;
    const queryOptions = {};
    if (name) {
      queryOptions.name = { $regex: name, $options: 'i' }; // 模糊搜索
    }

    const genres = await ctx.model.Genre.find(queryOptions)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await ctx.model.Genre.countDocuments(queryOptions);
    ctx.body = { success: true, data: genres, total };
  }

  // GET /api/genres/all - 获取所有类型 (不分页，用于下拉选择)
  async all() {
    const { ctx } = this;
    const genres = await ctx.model.Genre.find({}).sort({ name: 1 });
    ctx.body = { success: true, data: genres };
  }

  // POST /api/genres - 创建新类型
  async create() {
    const { ctx } = this;
    const { name } = ctx.request.body;
    if (!name || name.trim() === '') {
      ctx.status = 422;
      ctx.body = { success: false, message: '类型名称不能为空' };
      return;
    }
    try {
      const existingGenre = await ctx.model.Genre.findOne({ name: name.trim() });
      if (existingGenre) {
        ctx.status = 409; // Conflict
        ctx.body = { success: false, message: '该类型已存在' };
        return;
      }
      const genre = new ctx.model.Genre({ name: name.trim() });
      await genre.save();
      ctx.body = { success: true, data: genre, message: '类型创建成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: '创建类型失败', error: error.message };
    }
  }

  // GET /api/genres/:id - 获取单个类型
  async show() {
    const { ctx } = this;
    const genre = await ctx.model.Genre.findById(ctx.params.id);
    if (!genre) {
      ctx.status = 404;
      ctx.body = { success: false, message: '类型未找到' };
      return;
    }
    ctx.body = { success: true, data: genre };
  }

  // PUT /api/genres/:id - 更新类型
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name } = ctx.request.body;
    if (!name || name.trim() === '') {
      ctx.status = 422;
      ctx.body = { success: false, message: '类型名称不能为空' };
      return;
    }
    try {
      const genreToUpdate = await ctx.model.Genre.findById(id);
      if (!genreToUpdate) {
        ctx.status = 404;
        ctx.body = { success: false, message: '类型未找到' };
        return;
      }
      // 检查新名称是否与其他现有类型冲突（排除当前正在更新的类型）
      const existingGenreWithNewName = await ctx.model.Genre.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingGenreWithNewName) {
        ctx.status = 409; // Conflict
        ctx.body = { success: false, message: '该类型名称已存在' };
        return;
      }
      genreToUpdate.name = name.trim();
      await genreToUpdate.save();
      ctx.body = { success: true, data: genreToUpdate, message: '类型更新成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: '更新类型失败', error: error.message };
    }
  }

  // DELETE /api/genres/:id - 删除类型
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    try {
      // TODO: 检查该类型是否被任何电影使用，如果使用则阻止删除或给出提示
      const genre = await ctx.model.Genre.findByIdAndDelete(id);
      if (!genre) {
        ctx.status = 404;
        ctx.body = { success: false, message: '类型未找到' };
        return;
      }
      ctx.body = { success: true, message: '类型删除成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: '删除类型失败', error: error.message };
    }
  }

  // POST /api/genres/batch_destroy - 批量删除类型
  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body; // ids 是一个包含多个 id 的数组
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        ctx.status = 400;
        ctx.body = { success: false, message: '请提供要删除的类型ID列表' };
        return;
    }
    try {
        // TODO: 检查这些类型是否被任何电影使用
        const result = await ctx.model.Genre.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount > 0) {
            ctx.body = { success: true, message: `成功删除 ${result.deletedCount} 个类型` };
        } else {
            ctx.body = { success: false, message: '没有找到要删除的类型' };
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: '批量删除类型失败', error: error.message };
    }
  }

  async showGenreContentPage() {
    const { ctx } = this;
    await ctx.render('genre_content.html', { layout: false }); // 渲染时不使用布局文件
  }

}

module.exports = GenreController;