'use strict';

module.exports = {
  schedule: {
    interval: '10s', // 每 10 秒执行一次，用于检查并调度动态任务
    type: 'all', // 所有 worker 都执行
    immediate: false, // 应用启动时不立即执行
  },
  async task(ctx) {
    const { app } = ctx;

    try {
      // 查找所有已启用的任务
      const allEnabledTasks = await app.model.ScheduledTask.find({
        isEnabled: true,
      });

      if (allEnabledTasks.length === 0) {
        ctx.logger.info('[DynamicScheduler] No enabled scheduled tasks to check.');
        return;
      }

      const now = new Date();
      const tasksToRun = [];

      for (const task of allEnabledTasks) {
        // 确保 lastRunAt 是一个有效的 Date 对象或者为 null
        const lastRunTime = task.lastRunAt instanceof Date && !isNaN(task.lastRunAt.getTime())
          ? task.lastRunAt.getTime()
          : 0; // 如果是 null 或 Invalid Date，视为 0，确保首次运行或修复后运行

        // 判断是否需要执行：从未运行过 或 距离上次运行时间已超过设定的间隔
        if (
          !task.lastRunAt || // 从未运行过 (lastRunAt 为 null 或 undefined)
          isNaN(lastRunTime) || // lastRunAt 是 Invalid Date (在数据库中存为Invalid Date时，new Date(task.lastRunAt) 也会是 Invalid Date)
          (now.getTime() - lastRunTime >= task.intervalSeconds * 1000)
        ) {
          tasksToRun.push(task);
        }
      }

      if (tasksToRun.length === 0) {
        ctx.logger.info('[DynamicScheduler] No scheduled tasks due for execution.');
        return;
      }

      for (const task of tasksToRun) {
        ctx.logger.info(`[DynamicScheduler] Running task: ${task.name} (Type: ${task.taskType})`);
        try {
          const taskConfig = {};
          if (task.taskType === 'clean_logs') {
            // 这里的 deleteCount 可以根据 ScheduledTask 模型中的额外参数来设置
            // 例如，如果 ScheduledTask 模型有一个 `params` 字段存储 JSON 配置
            // taskConfig.deleteCount = task.params?.deleteCount || 100;
            taskConfig.deleteCount = 100; // 暂时硬编码为100
          }

          await ctx.service.taskRunner.runTask(task.taskType, taskConfig);

          // 更新任务的 lastRunAt
          await app.model.ScheduledTask.findByIdAndUpdate(task._id, { lastRunAt: new Date() });
        } catch (taskError) {
          ctx.logger.error(`[DynamicScheduler] Error running task ${task.name}: ${taskError.message}`, taskError);
        }
      }
    } catch (error) {
      ctx.logger.error(`[DynamicScheduler] Error fetching scheduled tasks: ${error.message}`, error);
    }
  },
}; 