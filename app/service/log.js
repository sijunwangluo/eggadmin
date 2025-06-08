'use strict';

const Service = require('egg').Service;

class LogService extends Service {
  async record(module, action, entityId = null, details = null) {
    const { ctx } = this;
    const user = ctx.session.user;
    const userId = user ? user.id : null;
    const username = user ? user.username : '匿名用户';
    const ipAddress = ctx.ip;

    if (!userId) {
      ctx.logger.warn('Attempted to log action without authenticated user: %j', { module, action, entityId, details, ipAddress });
      return;
    }

    try {
      await ctx.model.Log.create({
        userId,
        username,
        module,
        action,
        entityId,
        details,
        ipAddress
      });
      ctx.logger.info(`Log recorded: User ${username} (${userId}) performed ${action} on ${module} (Entity ID: ${entityId}) from IP ${ipAddress}`);
    } catch (error) {
      ctx.logger.error(`Failed to record log for user ${username} (${userId}) on ${module} ${action}: ${error.message}`, error);
    }
  }
}

module.exports = LogService; 