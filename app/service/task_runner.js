'use strict';

const Service = require('egg').Service;

class TaskRunnerService extends Service {
  /**
   * 执行特定类型的定时任务
   * @param {string} taskType - 任务类型，例如 'clean_logs'
   * @param {object} config - 任务的配置参数，例如 { deleteCount: 100 }
   */
  async runTask(taskType, config) {
    const { ctx } = this;
    ctx.logger.info(`[TaskRunnerService] Attempting to run task type: ${taskType} with config: %j`, config);

    switch (taskType) {
      case 'clean_logs':
        await this.cleanLogs(config.deleteCount);
        break;
      // 未来可以添加更多任务类型
      // case 'backup_data':
      //   await this.backupData(config.retentionDays);
      //   break;
      default:
        ctx.logger.warn(`[TaskRunnerService] Unknown task type: ${taskType}`);
        break;
    }
  }

  /**
   * 清理旧日志的实际逻辑
   * @param {number} deleteCount - 每次删除的日志数量
   */
  async cleanLogs(deleteCount) {
    const { ctx } = this;
    try {
      const logsToDelete = await ctx.model.Log.find()
        .sort({ timestamp: 1 })
        .limit(deleteCount)
        .select('_id');

      if (logsToDelete.length === 0) {
        ctx.logger.info('[TaskRunnerService] CleanLogs: No old logs to clean.');
        return 0; // 返回0表示没有删除
      }

      const idsToDelete = logsToDelete.map(log => log._id);
      const result = await ctx.model.Log.deleteMany({ _id: { $in: idsToDelete } });
      ctx.logger.info(`[TaskRunnerService] CleanLogs: Cleaned ${result.deletedCount} old logs.`);
      return result.deletedCount;
    } catch (error) {
      ctx.logger.error(`[TaskRunnerService] CleanLogs: Error cleaning logs: ${error.message}`, error);
      throw error; // 抛出错误以便调度器捕获
    }
  }
}

module.exports = TaskRunnerService; 