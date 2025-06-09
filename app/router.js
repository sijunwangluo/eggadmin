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

  // 会员管理内容页
  router.get('/member-content', auth, controller.member.showMemberContentPage);

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

  // 会员管理 API
  router.get('/api/members', auth, controller.member.index);
  router.post('/api/members', auth, controller.member.create);
  router.put('/api/members/:id', auth, controller.member.update);
  router.delete('/api/members/:id', auth, controller.member.destroy);
  router.post('/api/members/batchDelete', auth, controller.member.batchDestroy);

  // 标签管理内容页
  router.get('/tag-content', auth, controller.tag.showTagContentPage);

  // 日志管理 API
  router.get('/api/logs', auth, controller.log.index);

  // 日志管理内容页
  router.get('/log-content', auth, controller.log.showLogContentPage);

  // 定时任务内容页
  router.get('/schedule-content', auth, controller.schedule.showScheduleContentPage);

  // 定时任务管理 API
  router.get('/api/scheduled_tasks', auth, controller.scheduledTask.index);
  router.post('/api/scheduled_tasks', auth, controller.scheduledTask.create);
  router.put('/api/scheduled_tasks/:id', auth, controller.scheduledTask.update);
  router.delete('/api/scheduled_tasks/:id', auth, controller.scheduledTask.destroy);
  router.post('/api/scheduled_tasks/batchDelete', auth, controller.scheduledTask.batchDestroy);
  router.post('/api/scheduled_tasks/:id/toggleEnable', auth, controller.scheduledTask.toggleEnable);

  // 轮播图管理 API
  router.get('/api/carousels', auth, controller.carousel.index);
  router.post('/api/carousels', auth, controller.carousel.create);
  router.put('/api/carousels/:id', auth, controller.carousel.update);
  router.delete('/api/carousels/:id', auth, controller.carousel.destroy);
  router.post('/api/carousels/batchDelete', auth, controller.carousel.batchDestroy);

  // 轮播图管理内容页
  router.get('/carousel-content', auth, controller.carousel.showCarouselContentPage);

  // 电影管理 API
  router.get('/api/movies', auth, controller.movie.index);
  router.post('/api/movies', auth, controller.movie.create);
  router.put('/api/movies/:id', auth, controller.movie.update);
  router.delete('/api/movies/:id', auth, controller.movie.destroy);
  router.post('/api/movies/batchDelete', auth, controller.movie.batchDestroy);

  // 电影管理内容页
  router.get('/movie-content', auth, controller.movie.showMovieContentPage);
};
