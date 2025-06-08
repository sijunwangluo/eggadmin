'use strict';

const Controller = require('egg').Controller;

class ScheduleController extends Controller {
  async showScheduleContentPage() {
    const { ctx } = this;
    await ctx.render('schedule_content.html');
  }
}

module.exports = ScheduleController; 