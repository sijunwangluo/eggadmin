'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.ctx.render('layout.html', {
      user: this.ctx.session.user,
      csrf: this.ctx.csrf
    });
  }
}

module.exports = HomeController;
