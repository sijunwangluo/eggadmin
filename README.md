# EggAdmin - 电影后台管理系统

这是一个基于 Egg.js 和 Vue.js (Element UI) 构建的电影后台管理系统。

## 功能特性

-   **电影管理**: 新增、编辑、删除、查询电影信息，支持从豆瓣采集电影数据。
-   **演员管理**: 新增、编辑、删除、查询演员信息。
-   **类型管理**: 新增、编辑、删除、查询电影类型信息。
-   **海报上传**: 支持上传电影海报，并提供预览功能。
-   **用户头像上传**: 支持用户上传头像。
-   **日志记录**: 记录系统操作日志。
-   **轮播图管理**: 管理首页轮播图。
-   **文章管理**: 管理文章内容。
-   **标签管理**: 管理标签信息。
-   **会员管理**: 管理会员信息。
-   **定时任务管理**: 管理和执行定时任务。
-   **系统设置**: 进行系统相关配置。
-   **用户管理与登录**: 提供用户认证和管理功能。

## 技术栈

-   **后端**: Egg.js
-   **前端**: Vue.js, Element UI
-   **数据库**: MongoDB (通过 Mongoose ODM)
-   **文件上传**: egg-multipart

## 环境准备

在开始之前，请确保您的开发环境中已安装以下软件：

-   Node.js (推荐 v16.x 或更高版本)
-   npm (通常随 Node.js 一起安装) 或 yarn
-   MongoDB (确保 MongoDB 服务正在运行)

## 安装与启动

1.  **克隆项目** (如果您是从 Git 仓库获取):
    ```bash
    git clone <repository-url>
    cd eggadmin
    ```

2.  **安装依赖**:
    在项目根目录下执行：
    ```bash
    npm install
    # 或者使用 yarn
    # yarn install
    ```

3.  **配置 MongoDB 连接**:
    根据您的 MongoDB 配置，可能需要修改 `config/config.default.js` 文件中的数据库连接设置。默认配置可能如下：
    ```javascript
    config.mongoose = {
      client: {
        url: 'mongodb://127.0.0.1/eggadmin_dev', // 修改为您的 MongoDB 连接字符串
        options: {},
      },
    };
    ```

4.  **启动项目**:
    ```bash
    npm run dev
    # 或者使用 yarn
    # yarn dev
    ```
    项目默认会在 `http://127.0.0.1:7001` 启动。

## 项目结构概览

```
eggadmin/
├── app/
│   ├── controller/     # 控制器层，处理业务逻辑和 HTTP 请求
│   ├── model/          # Mongoose 模型定义
│   ├── middleware/     # 中间件
│   ├── public/         # 静态资源 (CSS, JS, 图片等)
│   ├── router.js       # 路由定义
│   ├── schedule/       # 定时任务
│   ├── service/        # 服务层，封装可复用的业务逻辑
│   └── view/           # 视图模板 (HTML)
├── config/
│   ├── config.default.js # 默认配置文件
│   └── plugin.js         # 插件配置
├── test/                 # 测试文件
├── .eslintrc             # ESLint 配置文件
├── package.json          # 项目依赖和脚本
└── README.md             # 项目说明文档
```

## 主要 API 接口 (示例)

-   `GET /api/movies`: 获取电影列表
-   `POST /api/movies`: 新增电影
-   `PUT /api/movies/:id`: 更新电影
-   `DELETE /api/movies/:id`: 删除电影
-   `POST /api/movies/fetch_douban`: 从豆瓣采集电影
-   `GET /api/actors`: 获取演员列表
-   `GET /api/genres`: 获取类型列表
-   `POST /api/upload/avatar`: 上传用户头像
-   `POST /api/upload/poster`: 上传电影海报

## 注意事项

-   确保 CSRF token 在需要的地方正确配置和传递，特别是在文件上传等操作中。
-   文件上传的目录 (如 `app/public/uploads/avatars` 和 `app/public/uploads/posters`) 需要有写入权限。

## 贡献

欢迎提交 Pull Request 或 Issue 来改进此项目。

## 许可证

[MIT](LICENSE) (如果项目有 LICENSE 文件，请链接到它，否则可以移除此行或选择一个合适的许可证)
