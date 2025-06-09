module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const MovieSchema = new Schema({
    title: { type: String, required: true }, // 标题
    director: { type: String }, // 导演
    actors: [{ type: String }], // 演员
    genre: [{ type: String }], // 类型
    releaseDate: { type: Date }, // 上映日期
    duration: { type: Number }, // 时长 (分钟)
    posterUrl: { type: String }, // 海报图片地址
    description: { type: String }, // 简介
    rating: { type: Number, min: 0, max: 10 }, // 评分
    createdAt: { type: Date, default: Date.now }, // 创建时间
    updatedAt: { type: Date, default: Date.now }, // 更新时间
  }, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

  return mongoose.model('Movie', MovieSchema);
};