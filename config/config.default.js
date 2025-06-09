/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
'use strict';

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1717840000000_1234';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 配置安全选项
  config.security = {
    csrf: {
      enable: false, // 暂时关闭 CSRF 检查
      // 或者使用以下配置来豁免特定路由
      // ignore: ctx => ctx.path.startsWith('/api/')
    }
  };

  // 配置 session
  config.session = {
    key: 'EGG_SESS',
    maxAge: 24 * 3600 * 1000, // 1天
    httpOnly: true,
    encrypt: true,
  };

  // 配置视图引擎
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  };

  // 配置 multipart
  config.multipart = {
    mode: 'file',
    // fileSize: '10mb', // 可选：限制文件大小
    // fileExtensions: ['.jpg', '.png'], // 可选：限制文件扩展名
  };

  // 配置静态文件
  config.static = {
    prefix: '/public/',
    dir: 'app/public',
  };

  // 配置 MongoDB
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/egg_admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  };

  // 配置 multipart
  config.multipart = {
    mode: 'file',
    // fileSize: '10mb', // 可选：限制文件大小
    // fileExtensions: ['.jpg', '.png'], // 可选：限制文件扩展名
  };

  return {
    ...config,
    ...userConfig,
  };
};
