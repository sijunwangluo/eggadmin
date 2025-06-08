/**
 * @param {Egg.Application} app - egg application
 */
'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;

  // 登录相关路由
  router.get('/login', controller.login.index);
  router.post('/api/login', controller.login.login);
  router.post('/api/logout', controller.login.logout);

  // 初始化管理员账号（仅开发环境可用）
  if (app.config.env === 'local') {
    router.get('/init-admin', controller.user.initAdmin);
  }

  // 需要登录验证的路由
  const auth = middleware.auth();
  router.get('/', auth, controller.home.index);
  router.get('/user', auth, controller.user.showUserPage);
  router.get('/api/users', auth, controller.user.index);
  router.post('/api/users', auth, controller.user.create);
  router.put('/api/users/:id', auth, controller.user.update);
  router.delete('/api/users/:id', auth, controller.user.destroy);
  router.get('/user-content', auth, controller.user.showUserContentPage);
  router.get('/home-content', auth, app.controller.home.showHomeContentPage);
  router.get('/setting-content', auth, app.controller.setting.showSettingContentPage);
};
