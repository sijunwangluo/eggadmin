'use strict';

const Controller = require('egg').Controller;
const cheerio = require('cheerio');

class MovieController extends Controller {
  async index() {
    const { ctx } = this;
    const { page = 1, limit = 10, title, director, genre } = ctx.query;
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' }; // 模糊查询标题
    if (director) query.director = { $regex: director, $options: 'i' }; // 模糊查询导演
    if (genre) query.genre = genre; // 精确查询类型

    const movies = await ctx.model.Movie.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await ctx.model.Movie.countDocuments(query);
    ctx.body = { success: true, data: movies, total };
  }

  async create() {
    const { ctx } = this;
    const movie = new ctx.model.Movie(ctx.request.body);
    await movie.save();
    ctx.body = { success: true, data: movie };
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const movie = await ctx.model.Movie.findByIdAndUpdate(id, ctx.request.body, { new: true });
    if (!movie) {
      ctx.body = { success: false, message: '电影不存在' };
      return;
    }
    ctx.body = { success: true, data: movie };
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const movie = await ctx.model.Movie.findByIdAndDelete(id);
    if (!movie) {
      ctx.body = { success: false, message: '电影不存在' };
      return;
    }
    ctx.body = { success: true, message: '删除成功' };
  }

  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body; // ids 是一个包含多个 id 的数组
    const result = await ctx.model.Movie.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount > 0) {
      ctx.body = { success: true, message: `成功删除 ${result.deletedCount} 条记录` };
    } else {
      ctx.body = { success: false, message: '没有找到要删除的记录' };
    }
  }

  async showMovieContentPage() {
    const { ctx } = this;
    await ctx.render('movie_content.html');
  }

  async fetchDouban() {
    const { ctx } = this;
    const { doubanId } = ctx.request.body;
    if (!doubanId) {
      ctx.body = { success: false, message: '豆瓣ID不能为空' };
      return;
    }

    let numericDoubanId = doubanId;
    // 尝试从URL中提取ID
    if (doubanId.includes('movie.douban.com/subject/')) {
      const match = doubanId.match(/subject\/(\d+)/);
      if (match && match[1]) {
        numericDoubanId = match[1];
      } else {
        ctx.body = { success: false, message: '无效的豆瓣链接格式' };
        return;
      }
    } else if (!/^\d+$/.test(doubanId)) {
        ctx.body = { success: false, message: '无效的豆瓣ID格式' };
        return;
    }

    try {
      // 注意：豆瓣API有频率限制，且可能需要Referer等请求头
      // 真实的豆瓣API可能需要申请Key，这里使用一个公共的代理或直接请求（可能不稳定）
      // 豆瓣官方并未提供稳定的公开API用于直接获取电影详细信息
      // 以下为示例性的请求，实际项目中可能需要更完善的爬虫或第三方服务
      const doubanAPI = `https://movie.douban.com/subject/${numericDoubanId}`; // 使用一个示例apikey，实际可能无效或有调用次数限制
      const response = await ctx.curl(`https://movie.douban.com/subject/${numericDoubanId}/`, { // Added trailing slash
        dataType: 'text', // Expect HTML/text response
        followRedirect: true, // Follow redirects
        timeout: 10000, // 10 seconds timeout
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        }
      });

      if (response.status === 200 && response.data) {
ctx.logger.info('Douban HTML Response Status:', response.status);
        ctx.logger.info('Douban HTML Response Headers:', response.headers);
        // ctx.logger.info('Douban HTML Response Data:', response.data); // Log first few characters to avoid flooding logs
        if (response.data && typeof response.data === 'string') {
            ctx.logger.info('Douban HTML Response Data (first 500 chars):', response.data.substring(0, 500));
        } else {
            ctx.logger.info('Douban HTML Response Data:', response.data);
        }

        // Debugging the condition
        let isHtmlLooking = false;
        const isString = typeof response.data === 'string';
        if (isString) {
            // More robust check for HTML, looking for <html potentially with attributes
            isHtmlLooking = response.data.toLowerCase().includes('<html'); 
        }
        ctx.logger.info('[HTML Check Debug] typeof response.data:', typeof response.data);
        ctx.logger.info('[HTML Check Debug] isString:', isString);
        ctx.logger.info('[HTML Check Debug] response.data.toLowerCase().includes("<html") value is:', isHtmlLooking);
        // Log more of the beginning of the response data for better debugging
        if (isString) {
          ctx.logger.info('[HTML Check Debug] response.data (first 200 chars):', response.data.substring(0, 200));
        } else {
          ctx.logger.info('[HTML Check Debug] response.data is not a string.');
        }


        // Basic validation of the response (check if we got HTML)
        if (response.status !== 200 || !isString || !isHtmlLooking) {
          ctx.logger.error(
            '采集豆瓣电影失败: 未能成功获取豆瓣页面HTML.',
            'Status:', response.status,
            'isString:', isString,
            'isHtmlLooking:', isHtmlLooking
          );
          ctx.body = { success: false, message: '采集豆瓣电影失败: 未能成功获取豆瓣页面HTML' };
          return;
        }

        const $ = cheerio.load(response.data);

        // Extract movie information using Cheerio selectors (these are examples and might need adjustment)
        const title = $('h1 span[property="v:itemreviewed"]').text().trim();
        const director = $('a[rel="v:directedBy"]').first().text().trim(); // Use .first() in case there are multiple, though usually one
        const actors = [];
        $('a[rel="v:starring"]').each((i, elem) => {
          actors.push($(elem).text().trim());
        });
        const genres = [];
        $('span[property="v:genre"]').each((i, elem) => {
          genres.push($(elem).text().trim());
        });

        let releaseDate = null;
        $('span[property="v:initialReleaseDate"]').each((i, elem) => {
          const dateText = $(elem).text().trim();
          const match = dateText.match(/(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}|\d{4})/);
          if (match && match[0]) {
            if (!releaseDate || match[0].length > releaseDate.length) { // Prefer more complete date
              releaseDate = match[0];
            }
          }
        });

        const durationText = $('span[property="v:runtime"]').text().trim();
        const durationMatch = durationText.match(/(\d+)/);
        const duration = durationMatch ? parseInt(durationMatch[0], 10) : null;

        const posterUrl = $('img[rel="v:image"]').attr('src');
        // For description, Douban might have a hidden full description and a shorter visible one.
        // This selector tries to get the full one if available, otherwise the standard summary.
        let description = $('div#link-report span[property="v:summary"]').text().trim();
        if (!description) {
            description = $('span[property="v:summary"]').text().trim();
        }
        description = description.replace(/\s+/g, ' ');

        const rating = $('strong[property="v:average"]').text().trim();

        if (!title) {
          ctx.logger.error('采集豆瓣电影失败: 未能从HTML中解析出标题', { doubanId: numericDoubanId });
          ctx.body = { success: false, message: '采集豆瓣电影失败: 未能从HTML中解析出标题。请检查豆瓣页面结构或Cheerio选择器。' };
          return;
        }

        // Check if movie already exists by Douban ID
        const existingMovieByDoubanId = await ctx.model.Movie.findOne({ doubanId: numericDoubanId });
        if (existingMovieByDoubanId) {
          ctx.body = { success: false, message: `电影 (豆瓣ID: ${numericDoubanId}) "${existingMovieByDoubanId.title}" 已存在数据库中。` };
          return;
        }
        // Optionally, check by title if you want to be very strict, but Douban ID should be unique enough.
        // const existingMovieByTitle = await ctx.model.Movie.findOne({ title: title });
        // if (existingMovieByTitle) {
        //   ctx.body = { success: false, message: `电影 "${title}" 已存在数据库中 (通过标题匹配)。` };
        //   return;
        // }

        const movieData = {
          title,
          director,
          actors: actors.join(', '),
          genre: genres.join(', '),
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          duration,
          posterUrl,
          description,
          rating: parseFloat(rating) || 0,
          doubanId: numericDoubanId,
        };

        const newMovie = new ctx.model.Movie(movieData);
        await newMovie.save();

        ctx.body = { success: true, message: '电影采集成功！', data: newMovie };
      } else {
          ctx.logger.error('从豆瓣获取数据失败', { status: response.status, data: response.data ? response.data.substring(0, 200) : 'N/A' });
          ctx.body = { success: false, message: `从豆瓣获取数据失败，状态码: ${response.status}` };
        }
    } catch (error) {
      ctx.logger.error('采集豆瓣电影失败:', error);
      ctx.body = { success: false, message: '采集豆瓣电影时发生服务器内部错误: ' + error.message };
    }
  }
}

module.exports = MovieController;