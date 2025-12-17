# 公众号菜单模块使用指南

## 概述

已在管理端侧边栏菜单树中成功添加了"公众号"模块，该模块包含完整的微信公众号管理功能。

## 菜单结构

### 主模块
- **公众号** (`admin-wechat`) - 7号主模块，排序权重为70

### 子模块分类

#### 1. 消息管理 (`admin-wechat-management`)
- **粉丝管理** (`admin-wechat-fans`) - 公众号粉丝列表管理
- **订阅通知** (`admin-wechat-subscribe`) - 订阅消息通知管理
- **模板消息** (`admin-wechat-template`) - 模板消息配置与发送

#### 2. H5网页 (`admin-wechat-h5`)
- **页面管理** (`admin-wechat-h5-pages`) - H5页面创建和管理
- **模板管理** (`admin-wechat-h5-template`) - H5页面模板管理

#### 3. 微信卡券 (`admin-wechat-coupon`)
- **卡券列表** (`admin-wechat-coupon-list`) - 微信卡券管理
- **卡券模板** (`admin-wechat-coupon-template`) - 卡券模板配置
- **核销记录** (`admin-wechat-coupon-record`) - 卡券使用记录

#### 4. 素材管理 (`admin-wechat-material`)
- **图片素材** (`admin-wechat-material-image`) - 图片素材上传和管理
- **视频素材** (`admin-wechat-material-video`) - 视频素材管理
- **语音素材** (`admin-wechat-material-voice`) - 语音素材管理
- **图文素材** (`admin-wechat-material-article`) - 图文素材管理

#### 5. 自定义菜单 (`admin-wechat-menu`)
- **菜单配置** (`admin-wechat-menu-config`) - 公众号底部菜单配置
- **菜单关键词** (`admin-wechat-menu-keywords`) - 菜单点击关键词回复

#### 6. 授权管理 (`admin-wechat-oauth`)
- **用户授权** (`admin-wechat-oauth-user`) - 用户OAuth授权管理
- **应用授权** (`admin-wechat-oauth-app`) - 应用授权配置
- **令牌管理** (`admin-wechat-oauth-token`) - OAuth令牌管理

## 技术实现

### 数据库表结构

菜单数据存储在 `rbac_menus` 表中，主要字段：

- `id` - 主键
- `name` - 菜单标识符
- `title` - 菜单显示名称
- `path` - 前端路由路径
- `icon` - 菜单图标
- `parentId` - 父菜单ID
- `sortWeight` - 排序权重
- `status` - 状态（1-正常，2-禁用）

### 配置文件位置

- 菜单数据定义：`scripts/admin-menu-data.ts`
- 菜单初始化服务：`scripts/menu-seeder.service.ts`
- 菜单初始化脚本：`scripts/init-menu.js`

## 使用方法

### 1. 初始化菜单数据

```bash
# 方法一：使用 npm 脚本（推荐）
npm run menu:init

# 方法二：直接执行脚本
node scripts/init-menu.js init

# 方法三：完整数据库初始化（包含菜单）
npm run db:init
```

### 2. 查看菜单树结构

```bash
npm run menu:tree
```

### 3. 查看菜单统计信息

```bash
npm run menu:stats
```

## 前端集成

### 路由配置

前端需要根据菜单数据动态生成路由，菜单路径结构：

```
# 消息管理
/admin/wechat/message              # 消息管理主页
/admin/wechat/fans                # 粉丝管理
/admin/wechat/subscribe           # 订阅通知
/admin/wechat/template            # 模板消息

# H5网页
/admin/wechat/h5                  # H5网页主页
/admin/wechat/h5-pages           # 页面管理
/admin/wechat/h5-template         # 模板管理

# 微信卡券
/admin/wechat/coupon              # 微信卡券主页
/admin/wechat/coupon-list         # 卡券列表
/admin/wechat/coupon-template     # 卡券模板
/admin/wechat/coupon-record       # 核销记录

# 素材管理
/admin/wechat/material            # 素材管理主页
/admin/wechat/material-image      # 图片素材
/admin/wechat/material-video      # 视频素材
/admin/wechat/material-voice      # 语音素材
/admin/wechat/material-article    # 图文素材

# 自定义菜单
/admin/wechat/menu                # 自定义菜单主页
/admin/wechat/menu-config         # 菜单配置
/admin/wechat/menu-keywords       # 菜单关键词

# 授权管理
/admin/wechat/oauth               # 授权管理主页
/admin/wechat/oauth-user          # 用户授权
/admin/wechat/oauth-app           # 应用授权
/admin/wechat/oauth-token         # 令牌管理
```

### 图标配置

使用 Ant Design Icons：

```typescript
// icon 映射
{
  'wechat': 'WechatOutlined',
  'setting': 'SettingOutlined',
  'menu': 'MenuOutlined',
  'message': 'MessageOutlined',
  'team': 'TeamOutlined',
  'notification': 'NotificationOutlined',
  'qrcode': 'QrcodeOutlined',
  'user-add': 'UserAddOutlined'
}
```

## API 接口设计

基于菜单结构，后端需要实现对应的 API 接口：

### 消息管理
```
GET    /api/admin/wechat/fans            # 获取粉丝列表
GET    /api/admin/wechat/fans/:id        # 获取粉丝详情
PUT    /api/admin/wechat/fans/:id        # 更新粉丝信息
DELETE /api/admin/wechat/fans/:id        # 删除粉丝

GET    /api/admin/wechat/subscribe       # 获取订阅通知配置
POST   /api/admin/wechat/subscribe       # 更新订阅通知配置

GET    /api/admin/wechat/template        # 获取模板消息列表
POST   /api/admin/wechat/template        # 创建模板消息
PUT    /api/admin/wechat/template/:id    # 更新模板消息
DELETE /api/admin/wechat/template/:id    # 删除模板消息
POST   /api/admin/wechat/template/send   # 发送模板消息
```

### H5网页
```
GET    /api/admin/wechat/h5-pages       # 获取H5页面列表
POST   /api/admin/wechat/h5-pages       # 创建H5页面
PUT    /api/admin/wechat/h5-pages/:id   # 更新H5页面
DELETE /api/admin/wechat/h5-pages/:id   # 删除H5页面

GET    /api/admin/wechat/h5-template    # 获取H5模板列表
POST   /api/admin/wechat/h5-template    # 创建H5模板
PUT    /api/admin/wechat/h5-template/:id # 更新H5模板
DELETE /api/admin/wechat/h5-template/:id # 删除H5模板
```

### 微信卡券
```
GET    /api/admin/wechat/coupon-list     # 获取卡券列表
POST   /api/admin/wechat/coupon-list     # 创建卡券
PUT    /api/admin/wechat/coupon-list/:id # 更新卡券
DELETE /api/admin/wechat/coupon-list/:id # 删除卡券

GET    /api/admin/wechat/coupon-template # 获取卡券模板列表
POST   /api/admin/wechat/coupon-template # 创建卡券模板

GET    /api/admin/wechat/coupon-record   # 获取核销记录
POST   /api/admin/wechat/coupon/use     # 核销卡券
```

### 素材管理
```
GET    /api/admin/wechat/material-image   # 获取图片素材列表
POST   /api/admin/wechat/material-image   # 上传图片素材
DELETE /api/admin/wechat/material-image/:id # 删除图片素材

GET    /api/admin/wechat/material-video   # 获取视频素材列表
POST   /api/admin/wechat/material-video   # 上传视频素材
DELETE /api/admin/wechat/material-video/:id # 删除视频素材

GET    /api/admin/wechat/material-voice   # 获取语音素材列表
POST   /api/admin/wechat/material-voice   # 上传语音素材
DELETE /api/admin/wechat/material-voice/:id # 删除语音素材

GET    /api/admin/wechat/material-article  # 获取图文素材列表
POST   /api/admin/wechat/material-article  # 创建图文素材
PUT    /api/admin/wechat/material-article/:id # 更新图文素材
DELETE /api/admin/wechat/material-article/:id # 删除图文素材
```

### 自定义菜单
```
GET    /api/admin/wechat/menu-config      # 获取菜单配置
POST   /api/admin/wechat/menu-config      # 更新菜单配置
POST   /api/admin/wechat/menu/publish    # 发布菜单到微信

GET    /api/admin/wechat/menu-keywords   # 获取菜单关键词列表
POST   /api/admin/wechat/menu-keywords   # 创建菜单关键词
PUT    /api/admin/wechat/menu-keywords/:id # 更新菜单关键词
DELETE /api/admin/wechat/menu-keywords/:id # 删除菜单关键词
```

### 授权管理
```
GET    /api/admin/wechat/oauth-user       # 获取用户授权列表
DELETE /api/admin/wechat/oauth-user/:id   # 撤销用户授权

GET    /api/admin/wechat/oauth-app        # 获取应用授权配置
POST   /api/admin/wechat/oauth-app        # 更新应用授权配置

GET    /api/admin/wechat/oauth-token      # 获取令牌列表
DELETE /api/admin/wechat/oauth-token/:id  # 删除令牌
POST   /api/admin/wechat/oauth/refresh    # 刷新令牌
```

## 权限配置

每个菜单项都配置了对应的权限标识符：

### 消息管理权限
- `/admin/wechat/fans` - 粉丝管理权限
- `/admin/wechat/subscribe` - 订阅通知权限
- `/admin/wechat/template` - 模板消息权限

### H5网页权限
- `/admin/wechat/h5-pages` - H5页面管理权限
- `/admin/wechat/h5-template` - H5模板管理权限

### 微信卡券权限
- `/admin/wechat/coupon-list` - 卡券列表管理权限
- `/admin/wechat/coupon-template` - 卡券模板管理权限
- `/admin/wechat/coupon-record` - 卡券核销记录查看权限

### 素材管理权限
- `/admin/wechat/material-image` - 图片素材管理权限
- `/admin/wechat/material-video` - 视频素材管理权限
- `/admin/wechat/material-voice` - 语音素材管理权限
- `/admin/wechat/material-article` - 图文素材管理权限

### 自定义菜单权限
- `/admin/wechat/menu-config` - 菜单配置权限
- `/admin/wechat/menu-keywords` - 菜单关键词权限

### 授权管理权限
- `/admin/wechat/oauth-user` - 用户授权管理权限
- `/admin/wechat/oauth-app` - 应用授权配置权限
- `/admin/wechat/oauth-token` - 令牌管理权限

### 模块访问权限
- `/admin/wechat/message` - 消息管理模块权限
- `/admin/wechat/h5` - H5网页模块权限
- `/admin/wechat/coupon` - 微信卡券模块权限
- `/admin/wechat/material` - 素材管理模块权限
- `/admin/wechat/menu` - 自定义菜单模块权限
- `/admin/wechat/oauth` - 授权管理模块权限

## 注意事项

1. **环境配置**：确保 `.env` 文件中已配置微信相关参数：
   ```
   WECHAT_APP_ID=your_wechat_app_id
   WECHAT_APP_SECRET=your_wechat_app_secret
   WECHAT_MCHID=your_wechat_mchid
   WECHAT_PUBLIC_ACCOUNT_ID=your_wechat_public_account_id
   WECHAT_PUBLIC_ACCOUNT_SECRET=your_wechat_public_account_secret
   ```

2. **数据库连接**：确保数据库连接配置正确，菜单初始化脚本会自动创建 `rbac_menus` 表。

3. **权限分配**：需要将新增的公众号菜单权限分配给相应的管理员角色。

4. **前端更新**：前端需要重新构建以包含新的路由和菜单。

## 扩展功能

后续可以考虑添加的公众号功能：

- 微信支付配置
- 小程序跳转配置
- 素材管理（图片、语音、视频）
- 用户标签管理
- 群发消息
- 数据统计分析
- 自动回复规则配置

## 故障排除

### 1. 菜单不显示
```bash
# 检查菜单数据
npm run menu:tree

# 检查权限配置
npm run menu:stats
```

### 2. 数据库错误
```bash
# 检查数据库连接
npm run db:health

# 重新初始化数据库
npm run db:update && npm run menu:init
```

### 3. 权限问题
确保管理员用户具有以下权限：
- 菜单查看权限
- 公众号模块相关权限
- 系统设置权限（如需）

---

## 联系支持

如有问题，请联系开发团队或查看项目文档。