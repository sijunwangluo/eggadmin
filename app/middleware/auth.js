'use strict';

module.exports = () => {
  return async function auth(ctx, next) {
    // 检查是否已登录
    if (!ctx.session.user) {
      // 如果是API请求，返回JSON响应
      if (ctx.path.startsWith('/api/')) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '请先登录'
        };
        return;
      }
      // 如果是页面请求，重定向到登录页
      ctx.redirect('/login');
      return;
    }
    await next();
  };
}; 