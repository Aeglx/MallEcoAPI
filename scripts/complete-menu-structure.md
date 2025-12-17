🎯 完整管理端菜单树结构

📊 总体统计:
🎯 总模块数: 11
📋 总菜单项: 约60+个
🔗 权限配置: 完整RBAC权限体系

## 📋 详细菜单结构

### 1️⃣ 会员管理 (Member)
👤 会员 (admin-member) [Order: 1]
├── 📋 会员管理 (admin-member-management)
│   ├── 👥 会员列表 → /admin/member/list
│   └── 🗑️  回收站 → /admin/member/recycle
├── 💰 预存款 (admin-member-deposit)
│   ├── 💵 会员资金 → /admin/member/funds
│   ├── ➕ 充值记录 → /admin/member/recharge
│   └── 🏦 提现申请 → /admin/member/withdraw
├── ⭐ 评价 (admin-member-evaluation)
│   └── 💬 会员评价 → /admin/member/reviews
└── 🎁 积分 (admin-member-points)
    └── 📜 积分历史 → /admin/member/points-history

### 2️⃣ 订单管理 (Order)
🛒 订单 (admin-order) [Order: 2]
├── 📦 订单 (admin-order-management)
│   ├── 🛍️  商品订单 → /admin/order/goods
│   └── ☁️  虚拟订单 → /admin/order/virtual
├── 🛠️ 售后 (admin-order-after-sale)
│   ├── 🔧 售后管理 → /admin/order/after-sale-manage
│   ├── ⚠️  交易投诉 → /admin/order/complaint
│   └── ❓  售后原因 → /admin/order/reason
└── 💳 流水 (admin-order-flow)
    ├── 💵 收款记录 → /admin/order/payment-record
    └── 🔄 退款流水 → /admin/order/refund-flow

### 3️⃣ 商品管理 (Goods)
🛍️ 商品 (admin-goods) [Order: 3]
├── 🔧 商品管理 (admin-goods-management)
│   ├── 🏪 平台商品 → /admin/goods/platform
│   └── ✅ 商品审核 → /admin/goods/audit
└── 🔗 关联管理 (admin-goods-related)
    ├── 📁 商品分类 → /admin/goods/category
    ├── 🏷️ 品牌列表 → /admin/goods/brand
    ├── 📏 规格列表 → /admin/goods/spec
    └── 🧮 计量单位 → /admin/goods/unit

### 4️⃣ 促销管理 (Promotion)
🚀 促销 (admin-promotion) [Order: 4]
└── 🔥 促销管理 (admin-promotion-management)
    ├── 🎫 优惠券 → /admin/promotion/coupon
    ├── 💰 满额活动 → /admin/promotion/full
    ├── ⏰ 秒杀活动 → /admin/promotion/seckill
    └── 👥 拼团活动 → /admin/promotion/group

### 5️⃣ 店铺管理 (Shop)
🏪 店铺 (admin-shop) [Order: 5]
├── 🔧 店铺管理 (admin-shop-management)
│   ├── 📋 店铺列表 → /admin/shop/list
│   └── ✅ 店铺审核 → /admin/shop/audit
└── 🧮 店铺结算 (admin-shop-settlement)
    ├── 💰 店铺结算 → /admin/shop/settlement-manage
    └── 📊 商家对账 → /admin/shop/reconciliation

### 6️⃣ 运营管理 (Operate)
🔧 运营 (admin-operate) [Order: 6]
├── 🎨 楼层装修 (admin-operate-decoration)
│   ├── 🖥️ PC端 → /admin/operate/pc
│   └── 📱 移动端 → /admin/operate/mobile
├── 📝 文章管理 (admin-operate-article)
│   ├── 🔥 搜索热词 → /admin/operate/hotwords
│   ├── 📁 文章分类 → /admin/operate/article-category
│   └── 📖 文章管理 → /admin/operate/article-manage
└── 💬 意见反馈 → /admin/operate/feedback

### 7️⃣ 公众号管理 (WeChat) 🆕
📱 公众号 (admin-wechat) [Order: 7]
├── 📨 消息管理 (admin-wechat-message)
│   ├── 👥 粉丝管理 → /admin/wechat/fans
│   ├── 🔔 订阅通知 → /admin/wechat/subscribe
│   └── 📄 模板消息 → /admin/wechat/template
├── 🌐 H5网页 (admin-wechat-h5)
│   ├── 📄 页面管理 → /admin/wechat/h5-pages
│   └── 🎨 模板管理 → /admin/wechat/h5-template
├── 🎫 微信卡券 (admin-wechat-coupon)
│   ├── 📋 卡券列表 → /admin/wechat/coupon-list
│   ├── 📄 卡券模板 → /admin/wechat/coupon-template
│   └── ✅ 核销记录 → /admin/wechat/coupon-record
├── 📁 素材管理 (admin-wechat-material)
│   ├── 🖼️ 图片素材 → /admin/wechat/material-image
│   ├── 🎥 视频素材 → /admin/wechat/material-video
│   ├── 🎵 语音素材 → /admin/wechat/material-voice
│   └── 📝 图文素材 → /admin/wechat/material-article
├── 📋 自定义菜单 (admin-wechat-menu)
│   ├── ⚙️ 菜单配置 → /admin/wechat/menu-config
│   └── 💬 菜单关键词 → /admin/wechat/menu-keywords
└── 🔐 授权管理 (admin-wechat-oauth)
    ├── 👤 用户授权 → /admin/wechat/oauth-user
    ├── 📱 应用授权 → /admin/wechat/oauth-app
    └── 🔑 令牌管理 → /admin/wechat/oauth-token

### 8️⃣ 直播管理 (Live)
📹 直播 (admin-live) [Order: 8]
└── 🎥 直播管理 (admin-live-management)
    ├── 🏠 直播间管理 → /admin/live/room
    ├── 🛍️ 直播商品 → /admin/live/goods
    └── 📊 直播统计 → /admin/live/statistics

### 9️⃣ 统计管理 (Statistics)
📊 统计 (admin-statistics) [Order: 9]
└── 📈 统计管理 (admin-statistics-management)
    ├── 👤 会员统计 → /admin/statistics/member
    ├── 🛒 订单统计 → /admin/statistics/order
    ├── 🛍️ 商品统计 → /admin/statistics/goods
    └── 🌊 流量统计 → /admin/statistics/traffic

### 🔟 系统设置 (Settings)
⚙️ 设置 (admin-settings) [Order: 10]
├── 🔧 系统设置 (admin-settings-system)
│   ├── ⚙️ 系统设置 → /admin/settings/basic
│   ├── ☁️ OSS资源 → /admin/settings/oss
│   ├── 🌍 行政地区 → /admin/settings/region
│   ├── 🚚 物流公司 → /admin/settings/logistics
│   ├── 🔐 信任登录 → /admin/settings/trust-login
│   ├── 💳 支付设置 → /admin/settings/payment
│   ├── ⚠️ 敏感词 → /admin/settings/sensitive
│   └── 📱 APP版本 → /admin/settings/app
└── 👥 用户管理 (admin-settings-user)
    ├── 👤 用户管理 → /admin/settings/user-manage
    ├── 📋 菜单管理 → /admin/settings/menu
    ├── 🏢 部门管理 → /admin/settings/department
    └── 🔐 角色权限 → /admin/settings/role

### 1️⃣1️⃣ 日志管理 (Log)
📝 日志 (admin-log) [Order: 11]
└── 🖥️ 系统监控 (admin-log-monitor)
    └── 📄 日志管理 → /admin/log/management

---

## 🎯 公众号模块详细结构 (新增)

### 📱 公众号管理总览
- **模块ID**: admin-wechat
- **排序**: 7
- **图标**: wechat
- **描述**: 公众号管理

### 📨 消息管理
- **粉丝管理**: 管理公众号粉丝信息
- **订阅通知**: 配置和发送订阅通知
- **模板消息**: 管理模板消息模板和发送

### 🌐 H5网页
- **页面管理**: 管理H5页面内容
- **模板管理**: 管理H5页面模板

### 🎫 微信卡券
- **卡券列表**: 管理已创建的卡券
- **卡券模板**: 创建和管理卡券模板
- **核销记录**: 查看卡券核销记录

### 📁 素材管理
- **图片素材**: 管理图片素材库
- **视频素材**: 管理视频素材库
- **语音素材**: 管理语音素材库
- **图文素材**: 管理图文素材库

### 📋 自定义菜单
- **菜单配置**: 配置公众号自定义菜单
- **菜单关键词**: 设置菜单点击关键词回复

### 🔐 授权管理
- **用户授权**: 管理用户授权记录
- **应用授权**: 管理应用授权配置
- **令牌管理**: 管理OAuth令牌

---

## 🏗️ 技术架构信息

### 权限体系
- **应用类型**: appType: 1 (管理端)
- **菜单层级**: 3层结构 (模块 → 分类 → 页面)
- **权限控制**: 基于permission字段的RBAC权限控制
- **菜单类型**: type 0 (目录) / type 1 (页面)

### 前端路由
- **基础路径**: /admin/{module}/{category}/{page}
- **路由映射**: frontRoute字段对应前端路由
- **层级关系**: parentId建立父子关系

### 数据库结构
- **主表**: sys_menu (系统菜单表)
- **关键字段**: id, title, path, level, parentId, sortOrder, permission, icon, type, appType
- **排序机制**: sortOrder字段控制显示顺序

---

*📅 更新时间: 2025-12-17*
*🔨 版本: v1.0*
*👨‍💻 维护者: MallEco Team*