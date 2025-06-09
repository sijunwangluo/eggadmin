'use strict';

const Controller = require('egg').Controller;

class ActorController extends Controller {
  // GET /api/actors - 获取所有演员 (分页)
  async index() {
    const { ctx } = this;
    const { page = 1, limit = 10, name } = ctx.query;
    const queryOptions = {};
    if (name) {
      queryOptions.name = { $regex: name, $options: 'i' }; // 模糊搜索
    }

    const actors = await ctx.model.Actor.find(queryOptions)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await ctx.model.Actor.countDocuments(queryOptions);
    ctx.body = { success: true, data: actors, total };
  }

  // GET /api/actors/all - 获取所有演员 (不分页，用于下拉选择)
  async all() {
    const { ctx } = this;
    const actors = await ctx.model.Actor.find({}).sort({ name: 1 });
    ctx.body = { success: true, data: actors };
  }

  // POST /api/actors - 创建新演员
  async create() {
    const { ctx } = this;
    const { name, avatar, bio } = ctx.request.body;
    if (!name || name.trim() === '') {
      ctx.status = 422;
      ctx.body = { success: false, message: '演员名称不能为空' };
      return;
    }
    try {
      const existingActor = await ctx.model.Actor.findOne({ name: name.trim() });
      if (existingActor) {
        ctx.status = 409; // Conflict
        ctx.body = { success: false, message: '该演员已存在' };
        return;
      }
      const actor = new ctx.model.Actor({ name: name.trim(), avatar, bio });
      await actor.save();
      ctx.body = { success: true, data: actor, message: '演员创建成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: '创建演员失败', error: error.message };
    }
  }

  // GET /api/actors/:id - 获取单个演员
  async show() {
    const { ctx } = this;
    const actor = await ctx.model.Actor.findById(ctx.params.id);
    if (!actor) {
      ctx.status = 404;
      ctx.body = { success: false, message: '演员未找到' };
      return;
    }
    ctx.body = { success: true, data: actor };
  }

  // PUT /api/actors/:id - 更新演员
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name, avatar, bio } = ctx.request.body;
    if (!name || name.trim() === '') {
      ctx.status = 422;
      ctx.body = { success: false, message: '演员名称不能为空' };
      return;
    }
    try {
      const actorToUpdate = await ctx.model.Actor.findById(id);
      if (!actorToUpdate) {
        ctx.status = 404;
        ctx.body = { success: false, message: '演员未找到' };
        return;
      }
      const existingActorWithNewName = await ctx.model.Actor.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingActorWithNewName) {
        ctx.status = 409; // Conflict
        ctx.body = { success: false, message: '该演员名称已存在' };
        return;
      }
      actorToUpdate.name = name.trim();
      actorToUpdate.avatar = avatar;
      actorToUpdate.bio = bio;
      await actorToUpdate.save();
      ctx.body = { success: true, data: actorToUpdate, message: '演员更新成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: '更新演员失败', error: error.message };
    }
  }

  // DELETE /api/actors/:id - 删除演员
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    try {
      // TODO: 检查该演员是否被任何电影使用
      const actor = await ctx.model.Actor.findByIdAndDelete(id);
      if (!actor) {
        ctx.status = 404;
        ctx.body = { success: false, message: '演员未找到' };
        return;
      }
      ctx.body = { success: true, message: '演员删除成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: '删除演员失败', error: error.message };
    }
  }

  // POST /api/actors/batch_destroy - 批量删除演员
  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body; // ids 是一个包含多个 id 的数组
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        ctx.status = 400;
        ctx.body = { success: false, message: '请提供要删除的演员ID列表' };
        return;
    }
    try {
        // TODO: 检查这些演员是否被任何电影使用
        const result = await ctx.model.Actor.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount > 0) {
            ctx.body = { success: true, message: `成功删除 ${result.deletedCount} 个演员` };
        } else {
            ctx.body = { success: false, message: '没有找到要删除的演员' };
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: '批量删除演员失败', error: error.message };
    }
  }

  async showActorContentPage() {
    const { ctx } = this;
    await ctx.render('actor_content.html'); // 假设你将创建一个 actor_content.html 视图文件
  }

}

module.exports = ActorController;