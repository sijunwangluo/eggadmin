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
  router.post('/api/movies/fetch_douban', auth, controller.movie.fetchDouban); // 新增采集豆瓣电影路由

  // 电影管理内容页
  router.get('/movie-content', auth, controller.movie.showMovieContentPage);

  // 电影类型管理 API
  router.get('/api/genres', auth, controller.genre.index);
  router.get('/api/genres/all', auth, controller.genre.all); // 获取所有类型，不分页
  router.post('/api/genres', auth, controller.genre.create);
  router.get('/api/genres/:id', auth, controller.genre.show);
  router.put('/api/genres/:id', auth, controller.genre.update);
  router.delete('/api/genres/:id', auth, controller.genre.destroy);
  router.post('/api/genres/batch_destroy', auth, controller.genre.batchDestroy);

  // 电影类型管理内容页
  router.get('/genre-content', auth, controller.genre.showGenreContentPage);

  // 演员管理 API
  router.get('/api/actors', auth, controller.actor.index);
  router.get('/api/actors/all', auth, controller.actor.all);
  router.post('/api/actors', auth, controller.actor.create);
  router.get('/api/actors/:id', auth, controller.actor.show);
  router.put('/api/actors/:id', auth, controller.actor.update);
  router.delete('/api/actors/:id', auth, controller.actor.destroy);
  router.post('/api/actors/batch_destroy', auth, controller.actor.batchDestroy);

  // 演员管理内容页
  router.get('/actor-content', auth, controller.actor.showActorContentPage);

  // 文件上传 API
  router.post('/api/upload/avatar', auth, controller.upload.avatar);
  router.post('/api/upload/poster', auth, controller.upload.poster); // 新增海报上传路由
};
