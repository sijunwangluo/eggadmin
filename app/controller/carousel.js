'use strict';

const Controller = require('egg').Controller;

class CarouselController extends Controller {
  async index() {
    const { ctx } = this;
    const carousels = await ctx.model.Carousel.find().sort({ sortOrder: 1, createdAt: -1 });
    ctx.body = { success: true, data: carousels };
  }

  async create() {
    const { ctx } = this;
    const { title, imageUrl, linkUrl, sortOrder, isEnabled } = ctx.request.body;
    const carousel = new ctx.model.Carousel({ title, imageUrl, linkUrl, sortOrder, isEnabled });
    await carousel.save();
    ctx.body = { success: true, data: carousel };
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { title, imageUrl, linkUrl, sortOrder, isEnabled } = ctx.request.body;
    const carousel = await ctx.model.Carousel.findByIdAndUpdate(id, { title, imageUrl, linkUrl, sortOrder, isEnabled }, { new: true });
    if (!carousel) {
      ctx.body = { success: false, message: '轮播图不存在' };
      return;
    }
    ctx.body = { success: true, data: carousel };
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const carousel = await ctx.model.Carousel.findByIdAndDelete(id);
    if (!carousel) {
      ctx.body = { success: false, message: '轮播图不存在' };
      return;
    }
    ctx.body = { success: true, message: '删除成功' };
  }

  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body; // ids 是一个包含多个 id 的数组
    const result = await ctx.model.Carousel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount > 0) {
      ctx.body = { success: true, message: `成功删除 ${result.deletedCount} 条记录` };
    } else {
      ctx.body = { success: false, message: '没有找到要删除的记录' };
    }
  }

  async showCarouselContentPage() {
    const { ctx } = this;
    await ctx.render('carousel_content.html');
  }
}

module.exports = CarouselController;