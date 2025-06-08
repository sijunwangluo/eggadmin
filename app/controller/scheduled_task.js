'use strict';

const Controller = require('egg').Controller;

class ScheduledTaskController extends Controller {
  async index() {
    const { ctx } = this;
    const { keyword = '', isEnabled, page = 1, pageSize = 10 } = ctx.query;
    const query = {};
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
        { taskType: new RegExp(keyword, 'i') },
      ];
    }
    if (isEnabled !== undefined) {
      query.isEnabled = isEnabled === 'true';
    }

    try {
      const total = await ctx.model.ScheduledTask.countDocuments(query);
      const list = await ctx.model.ScheduledTask.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      ctx.body = { list, pagination: { total, page: parseInt(page), pageSize: parseInt(pageSize) } };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '获取定时任务列表失败' };
      ctx.logger.error('获取定时任务列表失败:', error);
    }
  }

  async create() {
    const { ctx } = this;
    const { name, description, taskType, intervalSeconds, isEnabled } = ctx.request.body;

    if (!name || !taskType || !intervalSeconds) {
      ctx.status = 400;
      ctx.body = { error: '任务名称、类型、执行间隔为必填项' };
      return;
    }
    if (intervalSeconds < 5) {
      ctx.status = 400;
      ctx.body = { error: '执行间隔不能小于 5 秒' };
      return;
    }

    try {
      const task = await ctx.model.ScheduledTask.create({
        name,
        description,
        taskType,
        intervalSeconds,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
      });
      ctx.body = task;
      ctx.service.log.record('ScheduledTask', 'create', task._id, { name, taskType, intervalSeconds, isEnabled });
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        ctx.status = 409; // Conflict
        ctx.body = { error: '任务名称已存在' };
      } else {
        ctx.status = 500;
        ctx.body = { error: '创建定时任务失败: ' + error.message };
      }
      ctx.logger.error('创建定时任务失败:', error);
    }
  }

  async update() {
    const { ctx } = this;
    const id = ctx.params.id;
    const { name, description, taskType, intervalSeconds, isEnabled } = ctx.request.body;

    if (!name || !taskType || !intervalSeconds) {
      ctx.status = 400;
      ctx.body = { error: '任务名称、类型、执行间隔为必填项' };
      return;
    }
    if (intervalSeconds < 5) {
      ctx.status = 400;
      ctx.body = { error: '执行间隔不能小于 5 秒' };
      return;
    }

    try {
      const oldTask = await ctx.model.ScheduledTask.findById(id);
      if (!oldTask) {
        ctx.status = 404;
        ctx.body = { error: '定时任务不存在' };
        return;
      }

      const updatedTask = await ctx.model.ScheduledTask.findByIdAndUpdate(
        id,
        { name, description, taskType, intervalSeconds, isEnabled },
        { new: true, runValidators: true }
      );

      ctx.body = updatedTask;

      const changes = {};
      if (oldTask.name !== name) changes.name = { old: oldTask.name, new: name };
      if (oldTask.description !== description) changes.description = { old: oldTask.description, new: description };
      if (oldTask.taskType !== taskType) changes.taskType = { old: oldTask.taskType, new: taskType };
      if (oldTask.intervalSeconds !== intervalSeconds) changes.intervalSeconds = { old: oldTask.intervalSeconds, new: intervalSeconds };
      if (oldTask.isEnabled !== isEnabled) changes.isEnabled = { old: oldTask.isEnabled, new: isEnabled };
      ctx.service.log.record('ScheduledTask', 'update', updatedTask._id, changes);

    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        ctx.status = 409; // Conflict
        ctx.body = { error: '任务名称已存在' };
      } else {
        ctx.status = 500;
        ctx.body = { error: '更新定时任务失败: ' + error.message };
      }
      ctx.logger.error('更新定时任务失败:', error);
    }
  }

  async destroy() {
    const { ctx } = this;
    const id = ctx.params.id;

    try {
      const task = await ctx.model.ScheduledTask.findByIdAndDelete(id);
      if (!task) {
        ctx.status = 404;
        ctx.body = { error: '定时任务不存在' };
        return;
      }
      ctx.body = { message: '定时任务删除成功' };
      ctx.service.log.record('ScheduledTask', 'delete', id, { name: task.name });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '删除定时任务失败: ' + error.message };
      ctx.logger.error('删除定时任务失败:', error);
    }
  }

  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.status = 400;
      ctx.body = { error: '请提供有效的定时任务ID数组' };
      return;
    }

    try {
      const result = await ctx.model.ScheduledTask.deleteMany({ _id: { $in: ids } });
      if (result.deletedCount === 0) {
        ctx.status = 404;
        ctx.body = { error: '没有找到要删除的定时任务' };
        return;
      }
      ctx.body = { message: `成功删除了 ${result.deletedCount} 个定时任务` };
      ctx.service.log.record('ScheduledTask', 'batch_delete', null, { deletedCount: result.deletedCount, ids });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '批量删除定时任务失败: ' + error.message };
      ctx.logger.error('批量删除定时任务失败:', error);
    }
  }

  async toggleEnable() {
    const { ctx } = this;
    const id = ctx.params.id;
    const { isEnabled } = ctx.request.body;

    if (typeof isEnabled !== 'boolean') {
      ctx.status = 400;
      ctx.body = { error: 'isEnabled 必须是布尔值' };
      return;
    }

    try {
      const task = await ctx.model.ScheduledTask.findByIdAndUpdate(
        id,
        { isEnabled, updatedAt: new Date() },
        { new: true }
      );

      if (!task) {
        ctx.status = 404;
        ctx.body = { error: '定时任务不存在' };
        return;
      }

      ctx.body = { message: `定时任务 ${task.name} 已${isEnabled ? '启用' : '禁用'}`, task };
      ctx.service.log.record('ScheduledTask', isEnabled ? 'enable' : 'disable', id, { name: task.name, isEnabled });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `操作失败: ${error.message}` };
      ctx.logger.error(`切换定时任务启用状态失败: ${error.message}`, error);
    }
  }

}

module.exports = ScheduledTaskController; 