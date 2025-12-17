# 微信公众号管理模块开发文档

## 📋 模块概述

本文档描述了MallEco电商平台微信公众号管理模块的完整功能架构和实现细节。

## 🏗️ 模块结构

```
src/modules/wechat/
├── wechat.module.ts              # 主模块文件
├── wechat.controller.ts          # 主控制器
├── wechat.service.ts             # 主服务
├── controllers/                  # 控制器目录
│   ├── wechat-fans.controller.ts
│   ├── wechat-subscribe.controller.ts
│   ├── wechat-template.controller.ts
│   ├── wechat-h5.controller.ts
│   ├── wechat-coupon.controller.ts
│   ├── wechat-material.controller.ts
│   ├── wechat-menu.controller.ts
│   └── wechat-oauth.controller.ts
├── services/                     # 服务目录
│   ├── wechat-fans.service.ts
│   ├── wechat-subscribe.service.ts
│   ├── wechat-template.service.ts
│   ├── wechat-h5.service.ts
│   ├── wechat-coupon.service.ts
│   ├── wechat-material.service.ts
│   ├── wechat-menu.service.ts
│   └── wechat-oauth.service.ts
├── entities/                     # 实体目录
│   ├── base-wechat.entity.ts
│   ├── wechat-fans.entity.ts
│   ├── wechat-subscribe.entity.ts
│   ├── wechat-template.entity.ts
│   ├── wechat-h5-page.entity.ts
│   ├── wechat-h5-template.entity.ts
│   ├── wechat-coupon.entity.ts
│   ├── wechat-coupon-template.entity.ts
│   ├── wechat-coupon-record.entity.ts
│   ├── wechat-material-image.entity.ts
│   ├── wechat-material-video.entity.ts
│   ├── wechat-material-voice.entity.ts
│   ├── wechat-material-article.entity.ts
│   ├── wechat-menu.entity.ts
│   ├── wechat-menu-keyword.entity.ts
│   ├── wechat-oauth-user.entity.ts
│   ├── wechat-oauth-app.entity.ts
│   ├── wechat-oauth-token.entity.ts
│   └── index.ts
└── dto/                         # 数据传输对象
    ├── create-wechat-fans.dto.ts
    ├── update-wechat-fans.dto.ts
    ├── query-wechat-fans.dto.ts
    ├── create-wechat-subscribe.dto.ts
    ├── update-wechat-subscribe.dto.ts
    └── query-wechat-subscribe.dto.ts
```

## 🎯 功能模块详解

### 1. 消息管理

#### 1.1 粉丝管理 (Fans Management)
**功能描述**: 管理公众号粉丝信息，包括粉丝资料、关注状态、标签管理等。

**主要功能**:
- 粉丝列表查询与分页
- 粉丝信息CRUD操作
- 批量标签管理
- 黑名单管理
- 关注状态同步
- 粉丝统计分析

**API端点**: `/admin/wechat/fans`

**主要方法**:
```typescript
// 获取粉丝列表
GET /admin/wechat/fans

// 根据ID获取粉丝详情
GET /admin/wechat/fans/:id

// 根据openid获取粉丝详情
GET /admin/wechat/fans/openid/:openid

// 更新粉丝信息
PATCH /admin/wechat/fans/:id

// 批量更新粉丝标签
PATCH /admin/wechat/fans/tags/batch

// 批量更新黑名单状态
PATCH /admin/wechat/fans/blacklist/batch

// 更新关注状态
PATCH /admin/wechat/fans/subscribe/:openid

// 同步粉丝信息
PATCH /admin/wechat/fans/sync/:openid
```

#### 1.2 订阅通知 (Subscribe Management)
**功能描述**: 管理微信订阅消息，包括模板管理、消息发送、状态跟踪等。

**主要功能**:
- 订阅消息列表查询
- 模板消息发送
- 批量消息发送
- 发送状态跟踪
- 点击事件统计
- 重试机制管理

**API端点**: `/admin/wechat/subscribe`

#### 1.3 模板消息 (Template Management)
**功能描述**: 管理微信模板消息，包括模板配置、使用统计等。

**API端点**: `/admin/wechat/template`

### 2. H5网页管理

#### 2.1 页面管理 (H5 Page Management)
**功能描述**: 管理H5营销页面，支持富文本编辑、模板应用等功能。

**主要功能**:
- H5页面CRUD操作
- 页面统计分析
- 模板应用
- 访问数据跟踪

**API端点**: `/admin/wechat/h5-pages`

#### 2.2 模板管理 (H5 Template Management)
**功能描述**: 管理H5页面模板，提供模板创建、编辑、预览等功能。

**API端点**: `/admin/wechat/h5-template`

### 3. 微信卡券

#### 3.1 卡券列表 (Coupon List)
**功能描述**: 管理已发放的微信卡券，包括状态查询、使用统计等。

**API端点**: `/admin/wechat/coupon-list`

#### 3.2 卡券模板 (Coupon Template)
**功能描述**: 管理微信卡券模板，支持模板创建、编辑、批量发放等功能。

**API端点**: `/admin/wechat/coupon-template`

#### 3.3 核销记录 (Coupon Records)
**功能描述**: 查看卡券核销记录，包括核销时间、核销门店、订单信息等。

**API端点**: `/admin/wechat/coupon-record`

### 4. 素材管理

#### 4.1 图片素材 (Image Materials)
**功能描述**: 管理图片素材，支持上传、分类、使用统计等。

**API端点**: `/admin/wechat/material-image`

#### 4.2 视频素材 (Video Materials)
**功能描述**: 管理视频素材，支持上传、转码、播放统计等。

**API端点**: `/admin/wechat/material-video`

#### 4.3 语音素材 (Voice Materials)
**功能描述**: 管理语音素材，支持上传、播放统计等。

**API端点**: `/admin/wechat/material-voice`

#### 4.4 图文素材 (Article Materials)
**功能描述**: 管理图文素材，支持富文本编辑、阅读统计等。

**API端点**: `/admin/wechat/material-article`

### 5. 自定义菜单

#### 5.1 菜单配置 (Menu Configuration)
**功能描述**: 配置公众号自定义菜单，支持多级菜单、各种菜单类型等。

**API端点**: `/admin/wechat/menu-config`

**主要功能**:
- 菜单配置管理
- 菜单发布
- 菜单预览

#### 5.2 菜单关键词 (Menu Keywords)
**功能描述**: 管理菜单点击的关键词回复规则。

**API端点**: `/admin/wechat/menu-keywords`

### 6. 授权管理

#### 6.1 用户授权 (User Authorization)
**功能描述**: 管理用户授权记录，包括授权信息、访问统计等。

**API端点**: `/admin/wechat/oauth-user`

#### 6.2 应用授权 (App Authorization)
**功能描述**: 管理第三方应用授权，包括应用配置、权限管理等。

**API端点**: `/admin/wechat/oauth-app`

#### 6.3 令牌管理 (Token Management)
**功能描述**: 管理OAuth令牌，包括令牌生成、刷新、撤销等。

**API端点**: `/admin/wechat/oauth-token`

## 🗄️ 数据库设计

### 表结构说明

公众号管理模块包含17个数据表：

1. **wechat_fans** - 微信粉丝表
2. **wechat_subscribe** - 微信订阅通知表
3. **wechat_template** - 微信模板消息表
4. **wechat_h5_page** - 微信H5页面表
5. **wechat_h5_template** - 微信H5模板表
6. **wechat_coupon** - 微信卡券表
7. **wechat_coupon_template** - 微信卡券模板表
8. **wechat_coupon_record** - 微信卡券核销记录表
9. **wechat_material_image** - 微信图片素材表
10. **wechat_material_video** - 微信视频素材表
11. **wechat_material_voice** - 微信语音素材表
12. **wechat_material_article** - 微信图文素材表
13. **wechat_menu** - 微信菜单表
14. **wechat_menu_keyword** - 微信菜单关键词表
15. **wechat_oauth_user** - 微信用户授权表
16. **wechat_oauth_app** - 微信应用授权表
17. **wechat_oauth_token** - 微信授权令牌表

### 数据库初始化

执行以下SQL脚本来初始化数据库表：

```sql
-- 执行数据库表创建脚本
source /path/to/wechat_tables.sql;
```

## 🔧 环境配置

### 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_AES_KEY=your_wechat_aes_key

# 微信API配置
WECHAT_API_URL=https://api.weixin.qq.com
WECHAT_API_TIMEOUT=30000

# 文件存储配置
WECHAT_MATERIAL_UPLOAD_PATH=/uploads/wechat/material
WECHAT_H5_UPLOAD_PATH=/uploads/wechat/h5
```

## 🚀 部署说明

### 1. 安装依赖

```bash
npm install
```

### 2. 数据库迁移

```bash
# 执行数据库迁移
npm run migration:run

# 或直接执行SQL脚本
mysql -u username -p database_name < DB/wechat_tables.sql
```

### 3. 启动应用

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

## 📝 开发规范

### 1. 代码规范

- 使用 TypeScript 进行类型安全
- 遵循 NestJS 最佳实践
- 使用 ESLint 和 Prettier 进行代码格式化

### 2. API规范

- 统一使用 RESTful API 设计
- 使用 Swagger 进行API文档生成
- 统一的错误处理和响应格式

### 3. 数据验证

- 使用 class-validator 进行数据验证
- 使用 DTO 进行数据传输
- 统一的错误消息格式

## 🔍 测试

### 1. 单元测试

```bash
# 运行单元测试
npm run test

# 运行测试覆盖率
npm run test:cov
```

### 2. 集成测试

```bash
# 运行集成测试
npm run test:e2e
```

## 📊 监控与日志

### 1. 应用监控

- 使用 NestJS 内置监控
- 集成 Prometheus 指标收集
- 健康检查端点

### 2. 日志管理

- 统一的日志格式
- 分级日志记录
- 日志文件轮转

## 🔒 安全考虑

### 1. 权限控制

- 基于角色的访问控制(RBAC)
- JWT令牌认证
- API接口权限验证

### 2. 数据安全

- 敏感数据加密存储
- SQL注入防护
- XSS攻击防护

## 📈 性能优化

### 1. 数据库优化

- 合理的索引设计
- 查询优化
- 连接池管理

### 2. 缓存策略

- Redis缓存热点数据
- 查询结果缓存
- 接口响应缓存

## 🔄 版本管理

### 版本历史

- **v1.0.0** - 初始版本，包含基础功能
- **v1.1.0** - 新增订阅消息功能
- **v1.2.0** - 新增H5页面管理
- **v1.3.0** - 新增微信卡券功能

### 更新日志

每次版本更新需要更新CHANGELOG.md文件。

## 📞 支持与反馈

如有问题或建议，请联系：

- 邮箱: support@malleco.com
- 项目地址: https://github.com/malleco/wechat-module
- 文档地址: https://docs.malleco.com/wechat

---

*本文档最后更新时间: 2025-12-17*
*维护团队: MallEco Development Team*