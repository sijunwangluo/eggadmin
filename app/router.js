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
  router.post('/api/users/batchDelete', auth, controller.user.batchDestroy);
  router.get('/user-content', auth, controller.user.showUserContentPage);
  router.get('/home-content', auth, app.controller.home.showHomeContentPage);
  router.get('/setting-content', auth, app.controller.setting.showSettingContentPage);
  router.get('/article-content', auth, app.controller.article.showArticleContentPage);

  // 文章管理 API
  router.get('/api/articles', auth, controller.article.index);
  router.post('/api/articles', auth, controller.article.create);
  router.put('/api/articles/:id', auth, controller.article.update);
  router.delete('/api/articles/:id', auth, controller.article.destroy);
  router.post('/api/articles/batchDelete', auth, controller.article.batchDestroy);

  // 标签管理 API
  router.get('/api/tags', auth, controller.tag.index);
  router.post('/api/tags', auth, controller.tag.create);
  router.put('/api/tags/:id', auth, controller.tag.update);
  router.delete('/api/tags/:id', auth, controller.tag.destroy);
  router.post('/api/tags/batchDelete', auth, controller.tag.batchDestroy);

  // 标签管理内容页
  router.get('/tag-content', auth, controller.tag.showTagContentPage);

  // 日志管理 API
  router.get('/api/logs', auth, controller.log.index);

  // 日志管理内容页
  router.get('/log-content', auth, controller.log.showLogContentPage);
};
