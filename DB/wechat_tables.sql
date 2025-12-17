-- ========================================
-- 微信公众号管理相关数据库表
-- 创建时间: 2025-12-17
-- ========================================

-- 1. 微信粉丝表
CREATE TABLE IF NOT EXISTS `wechat_fans` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `openid` varchar(50) NOT NULL COMMENT 'openid',
  `unionid` varchar(100) DEFAULT NULL COMMENT 'unionid',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `sex` tinyint(1) DEFAULT 1 COMMENT '性别：0-未知，1-男，2-女',
  `city` varchar(200) DEFAULT NULL COMMENT '城市',
  `province` varchar(200) DEFAULT NULL COMMENT '省份',
  `country` varchar(50) DEFAULT NULL COMMENT '国家',
  `headimgurl` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `subscribe_status` tinyint(1) DEFAULT 0 COMMENT '关注状态：0-未关注，1-已关注',
  `subscribe_time` datetime DEFAULT NULL COMMENT '关注时间',
  `unsubscribe_time` datetime DEFAULT NULL COMMENT '取消关注时间',
  `remark` text COMMENT '备注',
  `tag_ids` json DEFAULT NULL COMMENT '标签ID列表',
  `blacklist` tinyint(1) DEFAULT 0 COMMENT '黑名单状态：0-正常，1-黑名单',
  `extra_info` text COMMENT '扩展信息',
  `qr_scene` varchar(50) DEFAULT NULL COMMENT '扫码场景值',
  `qr_scene_str` varchar(100) DEFAULT NULL COMMENT '扫码场景描述',
  `interaction_count` int(11) DEFAULT 0 COMMENT '互动次数',
  `last_interaction_time` datetime DEFAULT NULL COMMENT '最后互动时间',
  `points` decimal(10,2) DEFAULT 0.00 COMMENT '用户积分',
  `balance` decimal(10,2) DEFAULT 0.00 COMMENT '用户余额',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_subscribe_status` (`subscribe_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信粉丝表';

-- 2. 微信订阅通知表
CREATE TABLE IF NOT EXISTS `wechat_subscribe` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `openid` varchar(50) NOT NULL COMMENT '用户openid',
  `template_id` varchar(100) NOT NULL COMMENT '模板ID',
  `scene` varchar(100) DEFAULT NULL COMMENT '场景',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-已订阅，2-拒收，3-已发送',
  `content` text COMMENT '订阅内容',
  `template_data` json DEFAULT NULL COMMENT '模板数据',
  `send_time` datetime DEFAULT NULL COMMENT '发送时间',
  `click_time` datetime DEFAULT NULL COMMENT '点击时间',
  `click_url` text COMMENT '点击跳转链接',
  `remark` text COMMENT '备注',
  `retry_count` tinyint(4) DEFAULT 0 COMMENT '重试次数',
  `next_retry_time` datetime DEFAULT NULL COMMENT '下次重试时间',
  `error_message` text COMMENT '错误信息',
  `business_id` varchar(50) DEFAULT NULL COMMENT '关联业务ID',
  `business_type` varchar(50) DEFAULT NULL COMMENT '关联业务类型',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_openid` (`openid`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信订阅通知表';

-- 3. 微信模板消息表
CREATE TABLE IF NOT EXISTS `wechat_template` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `template_id` varchar(100) NOT NULL COMMENT '模板ID',
  `title` varchar(200) NOT NULL COMMENT '模板标题',
  `content` text NOT NULL COMMENT '模板内容',
  `example` varchar(100) DEFAULT NULL COMMENT '模板示例',
  `params` json DEFAULT NULL COMMENT '模板参数',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `type` tinyint(1) DEFAULT 2 COMMENT '模板类型：1-营销，2-通知',
  `category` varchar(100) DEFAULT NULL COMMENT '分类',
  `description` text COMMENT '描述',
  `send_count` int(11) DEFAULT 0 COMMENT '发送次数',
  `click_count` int(11) DEFAULT 0 COMMENT '点击次数',
  `last_send_time` datetime DEFAULT NULL COMMENT '最后发送时间',
  `last_click_time` datetime DEFAULT NULL COMMENT '最后点击时间',
  `click_rate` decimal(5,2) DEFAULT 0.00 COMMENT '点击率',
  `url` varchar(200) DEFAULT NULL COMMENT '跳转URL',
  `miniprogram_appid` varchar(100) DEFAULT NULL COMMENT '小程序appid',
  `miniprogram_path` varchar(200) DEFAULT NULL COMMENT '小程序路径',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_id` (`template_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信模板消息表';

-- 4. 微信H5页面表
CREATE TABLE IF NOT EXISTS `wechat_h5_page` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `title` varchar(200) NOT NULL COMMENT '页面标题',
  `content` text NOT NULL COMMENT '页面内容',
  `description` varchar(100) DEFAULT NULL COMMENT '页面描述',
  `cover` varchar(500) DEFAULT NULL COMMENT '页面封面',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `url` varchar(500) DEFAULT NULL COMMENT '页面URL',
  `config` json DEFAULT NULL COMMENT '页面配置',
  `view_count` int(11) DEFAULT 0 COMMENT '访问次数',
  `last_view_time` datetime DEFAULT NULL COMMENT '最后访问时间',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信H5页面表';

-- 5. 微信H5模板表
CREATE TABLE IF NOT EXISTS `wechat_h5_template` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `name` varchar(200) NOT NULL COMMENT '模板名称',
  `content` text NOT NULL COMMENT '模板内容',
  `description` varchar(100) DEFAULT NULL COMMENT '模板描述',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `preview` varchar(500) DEFAULT NULL COMMENT '模板预览图',
  `config` json DEFAULT NULL COMMENT '模板配置',
  `usage_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信H5模板表';

-- 6. 微信卡券表
CREATE TABLE IF NOT EXISTS `wechat_coupon` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `coupon_id` varchar(100) NOT NULL COMMENT '卡券ID',
  `title` varchar(200) NOT NULL COMMENT '卡券标题',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-未使用，2-已使用，3-已过期',
  `value` decimal(10,2) NOT NULL COMMENT '面额',
  `least_cost` decimal(10,2) NOT NULL COMMENT '最低消费',
  `begin_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `openid` varchar(50) DEFAULT NULL COMMENT '用户openid',
  `consume_time` datetime DEFAULT NULL COMMENT '使用时间',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupon_id` (`coupon_id`),
  KEY `idx_openid` (`openid`),
  KEY `idx_status` (`status`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信卡券表';

-- 7. 微信卡券模板表
CREATE TABLE IF NOT EXISTS `wechat_coupon_template` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `template_id` varchar(100) NOT NULL COMMENT '模板ID',
  `title` varchar(200) NOT NULL COMMENT '模板标题',
  `description` text COMMENT '使用说明',
  `value` decimal(10,2) NOT NULL COMMENT '面额',
  `least_cost` decimal(10,2) NOT NULL COMMENT '最低消费',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `quantity` int(11) DEFAULT 0 COMMENT '发放数量',
  `received_count` int(11) DEFAULT 0 COMMENT '已领取数量',
  `used_count` int(11) DEFAULT 0 COMMENT '已使用数量',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_id` (`template_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信卡券模板表';

-- 8. 微信卡券核销记录表
CREATE TABLE IF NOT EXISTS `wechat_coupon_record` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `coupon_id` varchar(100) NOT NULL COMMENT '卡券ID',
  `openid` varchar(50) NOT NULL COMMENT '用户openid',
  `status` tinyint(1) DEFAULT 1 COMMENT '核销状态：1-待核销，2-已核销，3-已过期',
  `verify_time` datetime NOT NULL COMMENT '核销时间',
  `verify_store` varchar(100) DEFAULT NULL COMMENT '核销门店',
  `verify_remark` text COMMENT '核销备注',
  `order_amount` decimal(10,2) NOT NULL COMMENT '订单金额',
  `order_id` varchar(100) DEFAULT NULL COMMENT '订单号',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_coupon_id` (`coupon_id`),
  KEY `idx_openid` (`openid`),
  KEY `idx_status` (`status`),
  KEY `idx_verify_time` (`verify_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信卡券核销记录表';

-- 9. 微信图片素材表
CREATE TABLE IF NOT EXISTS `wechat_material_image` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `media_id` varchar(100) NOT NULL COMMENT '媒体ID',
  `name` varchar(200) NOT NULL COMMENT '文件名称',
  `url` text NOT NULL COMMENT '文件URL',
  `size` int(11) NOT NULL COMMENT '文件大小(字节)',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `description` text COMMENT '图片描述',
  `usage_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_media_id` (`media_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信图片素材表';

-- 10. 微信视频素材表
CREATE TABLE IF NOT EXISTS `wechat_material_video` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `media_id` varchar(100) NOT NULL COMMENT '媒体ID',
  `name` varchar(200) NOT NULL COMMENT '文件名称',
  `url` text NOT NULL COMMENT '文件URL',
  `size` int(11) NOT NULL COMMENT '文件大小(字节)',
  `duration` int(11) NOT NULL COMMENT '播放时长(秒)',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `description` text COMMENT '视频描述',
  `play_count` int(11) DEFAULT 0 COMMENT '播放次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_media_id` (`media_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信视频素材表';

-- 11. 微信语音素材表
CREATE TABLE IF NOT EXISTS `wechat_material_voice` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `media_id` varchar(100) NOT NULL COMMENT '媒体ID',
  `name` varchar(200) NOT NULL COMMENT '文件名称',
  `url` text NOT NULL COMMENT '文件URL',
  `size` int(11) NOT NULL COMMENT '文件大小(字节)',
  `duration` int(11) NOT NULL COMMENT '播放时长(秒)',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `play_count` int(11) DEFAULT 0 COMMENT '播放次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_media_id` (`media_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信语音素材表';

-- 12. 微信图文素材表
CREATE TABLE IF NOT EXISTS `wechat_material_article` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `article_id` varchar(100) NOT NULL COMMENT '图文ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `cover` varchar(500) DEFAULT NULL COMMENT '封面图URL',
  `source_url` varchar(500) DEFAULT NULL COMMENT '原文链接',
  `digest` text COMMENT '摘要',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `read_count` int(11) DEFAULT 0 COMMENT '阅读次数',
  `share_count` int(11) DEFAULT 0 COMMENT '分享次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_id` (`article_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信图文素材表';

-- 13. 微信菜单表
CREATE TABLE IF NOT EXISTS `wechat_menu` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `menu_id` varchar(100) NOT NULL COMMENT '菜单ID',
  `type` varchar(50) NOT NULL COMMENT '菜单类型',
  `name` varchar(200) NOT NULL COMMENT '菜单名称',
  `menu_key` varchar(500) DEFAULT NULL COMMENT '菜单key',
  `url` varchar(500) DEFAULT NULL COMMENT '跳转URL',
  `miniprogram` text COMMENT '小程序信息',
  `parent_id` int(11) NOT NULL DEFAULT 0 COMMENT '父菜单ID，0为一级菜单',
  `sort_order` int(11) NOT NULL COMMENT '菜单排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `sub_buttons` json DEFAULT NULL COMMENT '子菜单',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_id` (`menu_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信菜单表';

-- 14. 微信菜单关键词表
CREATE TABLE IF NOT EXISTS `wechat_menu_keyword` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `keyword` varchar(100) NOT NULL COMMENT '关键词',
  `name` varchar(200) NOT NULL COMMENT '关键词名称',
  `content` text NOT NULL COMMENT '回复内容',
  `match_mode` varchar(50) NOT NULL COMMENT '匹配模式：exact-精确匹配，fuzzy-模糊匹配',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `usage_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `last_used_time` datetime DEFAULT NULL COMMENT '最后使用时间',
  `remark` text COMMENT '备注',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_keyword` (`keyword`),
  KEY `idx_match_mode` (`match_mode`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信菜单关键词表';

-- 15. 微信用户授权表
CREATE TABLE IF NOT EXISTS `wechat_oauth_user` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `openid` varchar(100) NOT NULL COMMENT '用户openid',
  `unionid` varchar(100) DEFAULT NULL COMMENT '用户unionid',
  `nickname` varchar(200) DEFAULT NULL COMMENT '用户昵称',
  `headimgurl` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `sex` tinyint(1) DEFAULT 1 COMMENT '性别：0-未知，1-男，2-女',
  `app_id` varchar(100) NOT NULL COMMENT '应用ID',
  `user_info` text COMMENT '用户信息',
  `auth_time` datetime NOT NULL COMMENT '授权时间',
  `last_access_time` datetime DEFAULT NULL COMMENT '最后访问时间',
  `access_count` int(11) DEFAULT 0 COMMENT '访问次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid_appid` (`openid`, `app_id`),
  KEY `idx_app_id` (`app_id`),
  KEY `idx_auth_time` (`auth_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信用户授权表';

-- 16. 微信应用授权表
CREATE TABLE IF NOT EXISTS `wechat_oauth_app` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `app_id` varchar(100) NOT NULL COMMENT '应用ID',
  `name` varchar(200) NOT NULL COMMENT '应用名称',
  `description` varchar(500) DEFAULT NULL COMMENT '应用描述',
  `app_secret` varchar(100) NOT NULL COMMENT '应用密钥',
  `redirect_uri` varchar(500) DEFAULT NULL COMMENT '授权回调域',
  `scopes` json DEFAULT NULL COMMENT '授权范围',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `user_count` int(11) DEFAULT 0 COMMENT '授权用户数',
  `last_auth_time` datetime DEFAULT NULL COMMENT '最后授权时间',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_id` (`app_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信应用授权表';

-- 17. 微信授权令牌表
CREATE TABLE IF NOT EXISTS `wechat_oauth_token` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `openid` varchar(100) NOT NULL COMMENT '用户openid',
  `app_id` varchar(100) NOT NULL COMMENT '应用ID',
  `access_token` varchar(500) NOT NULL COMMENT '访问令牌',
  `refresh_token` varchar(500) DEFAULT NULL COMMENT '刷新令牌',
  `expires_in` int(11) NOT NULL COMMENT '令牌有效期(秒)',
  `create_time` datetime NOT NULL COMMENT '令牌创建时间',
  `expire_time` datetime NOT NULL COMMENT '令牌过期时间',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-有效，0-无效',
  `last_used_time` datetime DEFAULT NULL COMMENT '最后使用时间',
  `usage_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `create_by_id` varchar(36) NOT NULL COMMENT '创建人ID',
  `update_by_id` varchar(36) NOT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid_appid` (`openid`, `app_id`),
  KEY `idx_app_id` (`app_id`),
  KEY `idx_expire_time` (`expire_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信授权令牌表';

-- ========================================
-- 索引优化
-- ========================================

-- 为高频查询字段添加复合索引
ALTER TABLE `wechat_fans` ADD INDEX `idx_subscribe_create_time` (`subscribe_status`, `create_time`);
ALTER TABLE `wechat_fans` ADD INDEX `idx_blacklist_create_time` (`blacklist`, `create_time`);

ALTER TABLE `wechat_subscribe` ADD INDEX `idx_openid_status` (`openid`, `status`);
ALTER TABLE `wechat_subscribe` ADD INDEX `idx_template_status_time` (`template_id`, `status`, `create_time`);

ALTER TABLE `wechat_template` ADD INDEX `idx_type_status` (`type`, `status`);
ALTER TABLE `wechat_template` ADD INDEX `idx_send_time` (`last_send_time`);

ALTER TABLE `wechat_coupon` ADD INDEX `idx_openid_status_time` (`openid`, `status`, `end_time`);
ALTER TABLE `wechat_coupon_template` ADD INDEX `idx_status_count` (`status`, `quantity`);

-- ========================================
-- 初始化数据
-- ========================================

-- 插入默认的菜单配置
INSERT INTO `wechat_menu` (`id`, `menu_id`, `type`, `name`, `menu_key`, `parent_id`, `sort_order`, `status`, `create_by_id`, `update_by_id`) VALUES
('default-menu-1', 'menu-1', 'click', '产品中心', 'PRODUCT_CENTER', 0, 1, 1, 'system', 'system'),
('default-menu-2', 'menu-2', 'click', '用户中心', 'USER_CENTER', 0, 2, 1, 'system', 'system'),
('default-menu-3', 'menu-3', 'click', '关于我们', 'ABOUT_US', 0, 3, 1, 'system', 'system');

-- 插入默认的关键词回复
INSERT INTO `wechat_menu_keyword` (`id`, `keyword`, `name`, `content`, `match_mode`, `status`, `create_by_id`, `update_by_id`) VALUES
('keyword-1', '你好', '问候语', '你好！欢迎使用MallEco电商平台！', 'exact', 1, 'system', 'system'),
('keyword-2', '帮助', '帮助信息', '您可以回复以下关键词：\n1. 产品 - 查看产品信息\n2. 订单 - 查看订单状态\n3. 客服 - 联系在线客服', 'exact', 1, 'system', 'system'),
('keyword-3', '客服', '客服信息', '客服热线：400-123-4567\n在线客服：点击下方菜单->用户中心->在线客服', 'exact', 1, 'system', 'system');

-- ========================================
-- 表注释说明
-- ========================================

-- 微信公众号管理相关表说明：
-- 1. wechat_fans: 存储微信粉丝信息
-- 2. wechat_subscribe: 存储订阅通知记录
-- 3. wechat_template: 存储模板消息配置
-- 4. wechat_h5_page: 存储H5页面内容
-- 5. wechat_h5_template: 存储H5页面模板
-- 6. wechat_coupon: 存储发放的卡券
-- 7. wechat_coupon_template: 存储卡券模板
-- 8. wechat_coupon_record: 存储卡券核销记录
-- 9. wechat_material_image: 存储图片素材
-- 10. wechat_material_video: 存储视频素材
-- 11. wechat_material_voice: 存储语音素材
-- 12. wechat_material_article: 存储图文素材
-- 13. wechat_menu: 存储自定义菜单配置
-- 14. wechat_menu_keyword: 存储菜单关键词回复
-- 15. wechat_oauth_user: 存储用户授权信息
-- 16. wechat_oauth_app: 存储应用授权配置
-- 17. wechat_oauth_token: 存储OAuth令牌信息