'use strict';

const Controller = require('egg').Controller;

class SettingController extends Controller {
  async showSettingContentPage() {
    const { ctx } = this;
    await ctx.render('setting_content.html');
  }
}

module.exports = SettingController; 