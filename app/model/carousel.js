module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CarouselSchema = new Schema({
    title: { type: String, required: true }, // 标题
    imageUrl: { type: String, required: true }, // 图片地址
    linkUrl: { type: String }, // 跳转链接
    sortOrder: { type: Number, default: 0 }, // 排序
    isEnabled: { type: Boolean, default: true }, // 是否启用
    createdAt: { type: Date, default: Date.now }, // 创建时间
    updatedAt: { type: Date, default: Date.now }, // 更新时间
  }, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

  return mongoose.model('Carousel', CarouselSchema);
};