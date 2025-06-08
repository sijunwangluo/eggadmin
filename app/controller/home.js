'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.ctx.render('layout.html', {
      user: this.ctx.session.user,
      csrf: this.ctx.csrf
    });
  }

  async showHomeContentPage() {
    const { ctx } = this;
    await ctx.render('home_content.html');
  }
}

module.exports = HomeController;
