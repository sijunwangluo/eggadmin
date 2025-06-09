'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
const pump = require('mz-modules/pump');

class UploadController extends Controller {
  async avatar() {
    const { ctx } = this;
    console.log(ctx.request.files);
   
    console.log(ctx.request.files[0].filename);
    
    
    const file = ctx.request.files[0];
    
    if (!file) {
      ctx.body = {
        success: false,
        message: '未选择任何文件',
      };
      ctx.status = 400;
      return;
    }

    const filename = Date.now() + '' + Math.floor(Math.random() * 10000) + path.extname(file.filename).toLowerCase();
    const targetDir = path.join(this.config.baseDir, 'app/public/uploads/avatars');

    // 确保目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, filename);

    try {
      const source = fs.createReadStream(file.filepath);
      const target = fs.createWriteStream(targetPath);
      await pump(source, target);
      ctx.body = {
        success: true,
        message: '头像上传成功',
        data: {
          url: `/public/uploads/avatars/${filename}`,
        },
      };
    } catch (err) {
      ctx.logger.error('文件上传失败:', err);
      ctx.body = {
        success: false,
        message: '文件上传失败',
        error: err.message,
      };
      ctx.status = 500;
    } finally {
      // 删除临时文件
      await ctx.cleanupRequestFiles();
    }
  }
}

module.exports = UploadController;