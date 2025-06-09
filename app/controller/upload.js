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

  async poster() {
    const { ctx } = this;
    // 校验文件是否存在
    if (!ctx.request.files || ctx.request.files.length === 0) {
      ctx.body = { success: false, message: '没有文件被上传' };
      return;
    }
    const file = ctx.request.files[0];
    let targetDir = '';
    try {
      // 1. 获取文件后缀，生成文件名
      const fileExt = path.extname(file.filename).toLowerCase();
      const fileName = `${Date.now()}${Math.floor(Math.random() * 10000)}${fileExt}`;

      // 2. 定义目标存储目录
      targetDir = path.join(this.config.baseDir, 'app/public/uploads/posters');

      // 3. 确保目录存在，如果不存在则创建
      await fs.promises.mkdir(targetDir, { recursive: true });

      // 4. 定义文件的完整目标路径
      const targetPath = path.join(targetDir, fileName);

      // 5. 创建可读流和可写流，并使用 pump 进行流式传输
      const source = fs.createReadStream(file.filepath);
      const target = fs.createWriteStream(targetPath);
      await pump(source, target);

      // 6. 返回成功响应，包含图片的URL
      // 注意：这里的URL应该是客户端可以访问到的相对或绝对路径
      // 例如，如果 'app/public' 是静态资源目录，则URL可以是 '/public/uploads/posters/fileName.ext'
      const fileUrl = `/public/uploads/posters/${fileName}`;
      ctx.body = { success: true, message: '海报上传成功', data: { url: fileUrl } };

    } catch (err) {
      ctx.logger.error('海报上传失败:', err);
      ctx.body = { success: false, message: '海报上传失败，请稍后重试。' };
    } finally {
      // 7. 清理临时文件
      if (file && file.filepath) {
        await ctx.cleanupRequestFiles(); // Egg.js 提供的清理方法
      }
    }
  }
}
module.exports = UploadController;