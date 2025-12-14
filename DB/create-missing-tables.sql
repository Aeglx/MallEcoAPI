-- MallEco API版缺失表结构创建脚本
-- 创建时间: 2025-12-11
-- 版本: 1.0

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =============================================
-- 商品管理模块 - 缺失表结构
-- =============================================

-- 商品主表
CREATE TABLE IF NOT EXISTS `mall_product` (
  `id` varchar(36) NOT NULL COMMENT '商品ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` varchar(500) DEFAULT NULL COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '商品价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存数量',
  `sales` int NOT NULL DEFAULT '0' COMMENT '销量',
  `main_image` varchar(255) DEFAULT NULL COMMENT '主图',
  `category_id` varchar(36) NOT NULL COMMENT '分类ID',
  `brand_id` varchar(36) DEFAULT NULL COMMENT '品牌ID',
  `is_show` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否上架(0:下架, 1:上架)',
  `is_new` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否新品(0:否, 1:是)',
  `is_hot` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否热门(0:否, 1:是)',
  `recommend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐(0:否, 1:是)',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `specifications` json DEFAULT NULL COMMENT '规格参数(JSON格式)',
  `details` text DEFAULT NULL COMMENT '商品详情',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_brand_id` (`brand_id`),
  KEY `idx_is_show` (`is_show`),
  KEY `idx_is_new` (`is_new`),
  KEY `idx_is_hot` (`is_hot`),
  KEY `idx_price` (`price`),
  KEY `idx_recommend` (`recommend`),
  KEY `idx_category_id_is_show_sort_order` (`category_id`, `is_show`, `sort_order`),
  KEY `idx_is_show_sort_order_created_at` (`is_show`, `sort_order`, `created_at`),
  FULLTEXT KEY `idx_name_is_show` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品主表';

-- 商品SKU表
CREATE TABLE IF NOT EXISTS `mall_product_sku` (
  `id` varchar(36) NOT NULL COMMENT 'SKU ID',
  `product_id` varchar(36) NOT NULL COMMENT '商品ID',
  `sku_sn` varchar(50) NOT NULL COMMENT 'SKU编号',
  `specifications` json NOT NULL COMMENT '规格参数(JSON格式)',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '价格',
  `original_price` decimal(12,2) DEFAULT NULL COMMENT '原价',
  `cost_price` decimal(12,2) DEFAULT NULL COMMENT '成本价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存数量',
  `warning_stock` int NOT NULL DEFAULT '10' COMMENT '库存预警值',
  `sales` int NOT NULL DEFAULT '0' COMMENT '销量',
  `weight` decimal(10,3) DEFAULT NULL COMMENT '重量(kg)',
  `volume` decimal(10,3) DEFAULT NULL COMMENT '体积(m³)',
  `barcode` varchar(50) DEFAULT NULL COMMENT '条形码',
  `image` varchar(500) DEFAULT NULL COMMENT 'SKU图片',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认SKU',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-正常 0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku_sn` (`sku_sn`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_price` (`price`),
  KEY `idx_stock` (`stock`),
  KEY `idx_sales` (`sales`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SKU表';

-- 商品分类表
CREATE TABLE IF NOT EXISTS `mall_product_category` (
  `id` varchar(36) NOT NULL COMMENT '分类ID',
  `parent_id` varchar(36) DEFAULT NULL COMMENT '父分类ID',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `level` tinyint(1) NOT NULL DEFAULT '1' COMMENT '分类层级',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值',
  `image` varchar(500) DEFAULT NULL COMMENT '分类图片',
  `keywords` varchar(200) DEFAULT NULL COMMENT '关键词',
  `description` varchar(500) DEFAULT NULL COMMENT '分类描述',
  `is_show` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否显示',
  `is_recommend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐',
  `commission_rate` decimal(5,2) DEFAULT NULL COMMENT '佣金比例',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_level` (`level`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_show` (`is_show`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 品牌表
CREATE TABLE IF NOT EXISTS `mall_product_brand` (
  `id` varchar(36) NOT NULL COMMENT '品牌ID',
  `name` varchar(100) NOT NULL COMMENT '品牌名称',
  `logo` varchar(500) DEFAULT NULL COMMENT '品牌Logo',
  `description` text COMMENT '品牌描述',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值',
  `is_show` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否显示',
  `is_recommend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_show` (`is_show`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品牌表';

-- =============================================
-- 会员管理模块 - 缺失表结构
-- =============================================

-- 会员等级表
CREATE TABLE IF NOT EXISTS `mall_member_level` (
  `id` varchar(36) NOT NULL COMMENT '等级ID',
  `level_name` varchar(50) NOT NULL COMMENT '等级名称',
  `level` int NOT NULL DEFAULT '1' COMMENT '等级值',
  `min_points` int NOT NULL DEFAULT '0' COMMENT '最小积分',
  `max_points` int NOT NULL DEFAULT '0' COMMENT '最大积分',
  `discount_rate` decimal(5,2) NOT NULL DEFAULT '100.00' COMMENT '折扣率',
  `privilege` json DEFAULT NULL COMMENT '特权配置(JSON格式)',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认等级',
  `is_show` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否显示',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_level` (`level`),
  KEY `idx_min_points` (`min_points`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级表';

-- 会员积分表
CREATE TABLE IF NOT EXISTS `mall_member_points` (
  `id` varchar(36) NOT NULL COMMENT '积分记录ID',
  `member_id` varchar(36) NOT NULL COMMENT '会员ID',
  `points_type` tinyint(1) NOT NULL COMMENT '积分类型: 1-获得 2-消费',
  `points` int NOT NULL DEFAULT '0' COMMENT '积分值',
  `balance` int NOT NULL DEFAULT '0' COMMENT '积分余额',
  `source_type` tinyint(1) NOT NULL COMMENT '来源类型: 1-注册 2-签到 3-购物 4-评价 5-分享',
  `source_id` varchar(36) DEFAULT NULL COMMENT '来源ID',
  `remark` varchar(200) DEFAULT NULL COMMENT '备注',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_points_type` (`points_type`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员积分表';

-- 会员优惠券表
CREATE TABLE IF NOT EXISTS `mall_member_coupon` (
  `id` varchar(36) NOT NULL COMMENT '优惠券ID',
  `member_id` varchar(36) NOT NULL COMMENT '会员ID',
  `coupon_id` varchar(36) NOT NULL COMMENT '优惠券模板ID',
  `coupon_name` varchar(100) NOT NULL COMMENT '优惠券名称',
  `coupon_type` tinyint(1) NOT NULL COMMENT '优惠券类型: 1-满减 2-折扣 3-包邮',
  `coupon_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠券面值',
  `min_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '最低使用金额',
  `discount_rate` decimal(5,2) DEFAULT NULL COMMENT '折扣率',
  `use_scope` json DEFAULT NULL COMMENT '使用范围(JSON格式)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-未使用 2-已使用 3-已过期',
  `get_time` datetime NOT NULL COMMENT '获取时间',
  `use_time` datetime DEFAULT NULL COMMENT '使用时间',
  `order_id` varchar(36) DEFAULT NULL COMMENT '使用的订单ID',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expire_time` (`expire_time`),
  KEY `idx_get_time` (`get_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员优惠券表';

-- =============================================
-- 营销推广模块 - 缺失表结构
-- =============================================

-- 优惠券表
CREATE TABLE IF NOT EXISTS `mall_promotion_coupon` (
  `id` varchar(36) NOT NULL COMMENT '优惠券ID',
  `coupon_name` varchar(100) NOT NULL COMMENT '优惠券名称',
  `coupon_type` tinyint(1) NOT NULL COMMENT '优惠券类型: 1-满减 2-折扣 3-包邮',
  `coupon_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠券面值',
  `min_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '最低使用金额',
  `discount_rate` decimal(5,2) DEFAULT NULL COMMENT '折扣率',
  `use_scope` json DEFAULT NULL COMMENT '使用范围(JSON格式)',
  `total_count` int NOT NULL DEFAULT '0' COMMENT '发放总数',
  `received_count` int NOT NULL DEFAULT '0' COMMENT '已领取数量',
  `used_count` int NOT NULL DEFAULT '0' COMMENT '已使用数量',
  `limit_per_user` int NOT NULL DEFAULT '1' COMMENT '每人限领数量',
  `validity_type` tinyint(1) NOT NULL COMMENT '有效期类型: 1-固定时间 2-领取后有效',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `valid_days` int DEFAULT NULL COMMENT '有效天数',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-启用 0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_coupon_type` (`coupon_type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- 秒杀活动表
CREATE TABLE IF NOT EXISTS `mall_promotion_seckill` (
  `id` varchar(36) NOT NULL COMMENT '秒杀活动ID',
  `seckill_name` varchar(100) NOT NULL COMMENT '秒杀活动名称',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-未开始 2-进行中 3-已结束',
  `limit_per_user` int NOT NULL DEFAULT '1' COMMENT '每人限购数量',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='秒杀活动表';

-- 秒杀商品表
CREATE TABLE IF NOT EXISTS `mall_promotion_seckill_goods` (
  `id` varchar(36) NOT NULL COMMENT '秒杀商品ID',
  `seckill_id` varchar(36) NOT NULL COMMENT '秒杀活动ID',
  `product_id` varchar(36) NOT NULL COMMENT '商品ID',
  `sku_id` varchar(36) NOT NULL COMMENT 'SKU ID',
  `seckill_price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '秒杀价格',
  `seckill_stock` int NOT NULL DEFAULT '0' COMMENT '秒杀库存',
  `sold_count` int NOT NULL DEFAULT '0' COMMENT '已售数量',
  `limit_per_user` int NOT NULL DEFAULT '1' COMMENT '每人限购数量',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-启用 0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_seckill_id` (`seckill_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sku_id` (`sku_id`),
  KEY `idx_seckill_price` (`seckill_price`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='秒杀商品表';

-- 拼团活动表
CREATE TABLE IF NOT EXISTS `mall_promotion_groupbuy` (
  `id` varchar(36) NOT NULL COMMENT '拼团活动ID',
  `groupbuy_name` varchar(100) NOT NULL COMMENT '拼团活动名称',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `group_size` int NOT NULL DEFAULT '2' COMMENT '成团人数',
  `valid_hours` int NOT NULL DEFAULT '24' COMMENT '有效时间(小时)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-未开始 2-进行中 3-已结束',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拼团活动表';

-- 拼团商品表
CREATE TABLE IF NOT EXISTS `mall_promotion_groupbuy_goods` (
  `id` varchar(36) NOT NULL COMMENT '拼团商品ID',
  `groupbuy_id` varchar(36) NOT NULL COMMENT '拼团活动ID',
  `product_id` varchar(36) NOT NULL COMMENT '商品ID',
  `sku_id` varchar(36) NOT NULL COMMENT 'SKU ID',
  `groupbuy_price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '拼团价格',
  `groupbuy_stock` int NOT NULL DEFAULT '0' COMMENT '拼团库存',
  `sold_count` int NOT NULL DEFAULT '0' COMMENT '已售数量',
  `limit_per_user` int NOT NULL DEFAULT '1' COMMENT '每人限购数量',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-启用 0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(36) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(36) DEFAULT NULL COMMENT '更新人',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`),
  KEY `idx_groupbuy_id` (`groupbuy_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sku_id` (`sku_id`),
  KEY `idx_groupbuy_price` (`groupbuy_price`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拼团商品表';

-- =============================================
-- 短信服务模块 - 表结构
-- =============================================

-- 短信日志表
CREATE TABLE IF NOT EXISTS `mall_sms_log` (
  `id` varchar(36) NOT NULL COMMENT '日志ID',
  `mobile` varchar(20) NOT NULL COMMENT '手机号',
  `template_code` varchar(50) NOT NULL COMMENT '模板代码',
  `template_param` json DEFAULT NULL COMMENT '模板参数(JSON格式)',
  `content` varchar(200) DEFAULT NULL COMMENT '短信内容',
  `sms_type` tinyint(1) NOT NULL COMMENT '短信类型: 1-验证码 2-通知 3-营销',
  `business_type` varchar(50) NOT NULL COMMENT '业务类型',
  `business_id` varchar(36) DEFAULT NULL COMMENT '业务ID',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '发送状态: 0-失败 1-成功',
  `error_msg` varchar(200) DEFAULT NULL COMMENT '错误信息',
  `request_id` varchar(100) DEFAULT NULL COMMENT '请求ID',
  `send_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_business_type` (`business_type`),
  KEY `idx_status` (`status`),
  KEY `idx_send_time` (`send_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信日志表';

-- 短信模板表
CREATE TABLE IF NOT EXISTS `mall_sms_template` (
  `id` varchar(36) NOT NULL COMMENT '模板ID',
  `template_code` varchar(50) NOT NULL COMMENT '模板代码',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `template_content` varchar(500) NOT NULL COMMENT '模板内容',
  `sms_type` tinyint(1) NOT NULL COMMENT '短信类型: 1-验证码 2-通知 3-营销',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`template_code`),
  KEY `idx_sms_type` (`sms_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信模板表';

-- 短信验证码表
CREATE TABLE IF NOT EXISTS `mall_sms_verification` (
  `id` varchar(36) NOT NULL COMMENT '验证码ID',
  `mobile` varchar(20) NOT NULL COMMENT '手机号',
  `code` varchar(10) NOT NULL COMMENT '验证码',
  `business_type` varchar(50) NOT NULL COMMENT '业务类型',
  `ip` varchar(50) DEFAULT NULL COMMENT '请求IP',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  `used` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否使用: 0-未使用 1-已使用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_mobile_business_type` (`mobile`, `business_type`),
  KEY `idx_expire_time` (`expire_time`),
  KEY `idx_used` (`used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信验证码表';

-- =============================================
-- 邮件服务模块 - 表结构
-- =============================================

-- 邮件日志表
CREATE TABLE IF NOT EXISTS `mall_email_log` (
  `id` varchar(36) NOT NULL COMMENT '日志ID',
  `to_email` varchar(100) NOT NULL COMMENT '收件人邮箱',
  `subject` varchar(200) NOT NULL COMMENT '邮件主题',
  `content` text COMMENT '邮件内容',
  `email_type` tinyint(1) NOT NULL COMMENT '邮件类型: 1-验证码 2-通知 3-营销',
  `business_type` varchar(50) NOT NULL COMMENT '业务类型',
  `business_id` varchar(36) DEFAULT NULL COMMENT '业务ID',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '发送状态: 0-失败 1-成功',
  `error_msg` varchar(200) DEFAULT NULL COMMENT '错误信息',
  `send_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_to_email` (`to_email`),
  KEY `idx_business_type` (`business_type`),
  KEY `idx_status` (`status`),
  KEY `idx_send_time` (`send_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件日志表';

-- 邮件模板表
CREATE TABLE IF NOT EXISTS `mall_email_template` (
  `id` varchar(36) NOT NULL COMMENT '模板ID',
  `template_code` varchar(50) NOT NULL COMMENT '模板代码',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `subject` varchar(200) NOT NULL COMMENT '邮件主题',
  `template_content` text NOT NULL COMMENT '模板内容',
  `email_type` tinyint(1) NOT NULL COMMENT '邮件类型: 1-验证码 2-通知 3-营销',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`template_code`),
  KEY `idx_email_type` (`email_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件模板表';

-- =============================================
-- 支付系统模块 - 表结构
-- =============================================

-- 支付方式表
CREATE TABLE IF NOT EXISTS `mall_payment_method` (
  `id` varchar(36) NOT NULL COMMENT '支付方式ID',
  `name` varchar(50) NOT NULL COMMENT '支付方式名称',
  `code` varchar(50) NOT NULL COMMENT '支付方式编码',
  `description` varchar(200) DEFAULT NULL COMMENT '支付方式描述',
  `icon` varchar(200) DEFAULT NULL COMMENT '支付方式图标',
  `config` json DEFAULT NULL COMMENT '支付配置(JSON格式)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付方式表';

-- 支付记录表
CREATE TABLE IF NOT EXISTS `mall_payment_record` (
  `id` varchar(36) NOT NULL COMMENT '支付记录ID',
  `order_id` varchar(36) NOT NULL COMMENT '订单ID',
  `order_sn` varchar(50) NOT NULL COMMENT '订单编号',
  `payment_method_code` varchar(50) NOT NULL COMMENT '支付方式编码',
  `payment_method_name` varchar(50) NOT NULL COMMENT '支付方式名称',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '支付金额',
  `currency` varchar(10) NOT NULL DEFAULT 'CNY' COMMENT '货币类型',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '支付状态: 0-待支付 1-支付成功 2-支付失败 3-已退款',
  `trade_no` varchar(100) DEFAULT NULL COMMENT '支付平台交易号',
  `out_trade_no` varchar(100) NOT NULL COMMENT '商户订单号',
  `notify_time` datetime DEFAULT NULL COMMENT '通知时间',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `client_ip` varchar(50) DEFAULT NULL COMMENT '客户端IP',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `extra_param` json DEFAULT NULL COMMENT '额外参数(JSON格式)',
  `error_msg` varchar(200) DEFAULT NULL COMMENT '错误信息',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_out_trade_no` (`out_trade_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_sn` (`order_sn`),
  KEY `idx_trade_no` (`trade_no`),
  KEY `idx_payment_method_code` (`payment_method_code`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- 支付回调日志表
CREATE TABLE IF NOT EXISTS `mall_payment_callback_log` (
  `id` varchar(36) NOT NULL COMMENT '日志ID',
  `payment_record_id` varchar(36) NOT NULL COMMENT '支付记录ID',
  `order_id` varchar(36) NOT NULL COMMENT '订单ID',
  `out_trade_no` varchar(100) NOT NULL COMMENT '商户订单号',
  `trade_no` varchar(100) DEFAULT NULL COMMENT '支付平台交易号',
  `payment_method_code` varchar(50) NOT NULL COMMENT '支付方式编码',
  `request_data` text COMMENT '请求数据',
  `response_data` text COMMENT '响应数据',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '处理状态: 0-失败 1-成功',
  `error_msg` varchar(200) DEFAULT NULL COMMENT '错误信息',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_payment_record_id` (`payment_record_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_out_trade_no` (`out_trade_no`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付回调日志表';

-- =============================================
-- 文件上传模块 - 表结构
-- =============================================

-- 文件表
CREATE TABLE IF NOT EXISTS `mall_file` (
  `id` varchar(36) NOT NULL COMMENT '文件ID',
  `file_name` varchar(200) NOT NULL COMMENT '文件名称',
  `file_path` varchar(500) NOT NULL COMMENT '文件路径',
  `file_url` varchar(500) NOT NULL COMMENT '文件URL',
  `file_size` bigint NOT NULL COMMENT '文件大小(字节)',
  `file_type` varchar(50) DEFAULT NULL COMMENT '文件类型',
  `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME类型',
  `storage_type` varchar(50) NOT NULL DEFAULT 'local' COMMENT '存储类型: local-本地 oss-阿里云OSS',
  `business_type` varchar(50) DEFAULT NULL COMMENT '业务类型',
  `business_id` varchar(36) DEFAULT NULL COMMENT '业务ID',
  `uploader_id` varchar(36) DEFAULT NULL COMMENT '上传人ID',
  `uploader_name` varchar(50) DEFAULT NULL COMMENT '上传人名称',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `md5` varchar(100) DEFAULT NULL COMMENT '文件MD5',
  `sha1` varchar(100) DEFAULT NULL COMMENT '文件SHA1',
  `upload_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_file_name` (`file_name`),
  KEY `idx_business_type` (`business_type`),
  KEY `idx_uploader_id` (`uploader_id`),
  KEY `idx_status` (`status`),
  KEY `idx_md5` (`md5`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- 文件目录表
CREATE TABLE IF NOT EXISTS `mall_file_directory` (
  `id` varchar(36) NOT NULL COMMENT '目录ID',
  `parent_id` varchar(36) DEFAULT NULL COMMENT '父目录ID',
  `name` varchar(100) NOT NULL COMMENT '目录名称',
  `path` varchar(500) NOT NULL COMMENT '目录路径',
  `level` tinyint(1) NOT NULL DEFAULT '1' COMMENT '目录层级',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_path` (`path`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件目录表';

-- =============================================
-- 滑块验证模块 - 表结构
-- =============================================

-- 滑块验证表
CREATE TABLE IF NOT EXISTS `mall_slider_verification` (
  `id` varchar(36) NOT NULL COMMENT '验证ID',
  `uuid` varchar(100) NOT NULL COMMENT '验证唯一标识',
  `background_image` varchar(500) NOT NULL COMMENT '背景图片URL',
  `slider_image` varchar(500) NOT NULL COMMENT '滑块图片URL',
  `x_position` int NOT NULL COMMENT '正确X坐标',
  `y_position` int NOT NULL COMMENT '正确Y坐标',
  `width` int NOT NULL COMMENT '图片宽度',
  `height` int NOT NULL COMMENT '图片高度',
  `slider_width` int NOT NULL COMMENT '滑块宽度',
  `slider_height` int NOT NULL COMMENT '滑块高度',
  `created_by` varchar(36) DEFAULT NULL COMMENT '创建人ID',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '验证状态: 0-未验证 1-验证成功 2-验证失败',
  `used_time` datetime DEFAULT NULL COMMENT '使用时间',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  KEY `idx_status` (`status`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='滑块验证表';

-- =============================================
-- 物流模块 - 表结构
-- =============================================

-- 物流配送方式表
CREATE TABLE IF NOT EXISTS `mall_logistics_method` (
  `id` varchar(36) NOT NULL COMMENT '配送方式ID',
  `name` varchar(100) NOT NULL COMMENT '配送方式名称',
  `code` varchar(50) NOT NULL COMMENT '配送方式编码',
  `description` varchar(200) DEFAULT NULL COMMENT '配送方式描述',
  `config` json DEFAULT NULL COMMENT '配送配置(JSON格式)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用 1-启用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物流配送方式表';

-- 物流订单表
CREATE TABLE IF NOT EXISTS `mall_logistics_order` (
  `id` varchar(36) NOT NULL COMMENT '物流订单ID',
  `order_id` varchar(36) NOT NULL COMMENT '订单ID',
  `order_sn` varchar(50) NOT NULL COMMENT '订单编号',
  `logistics_method_id` varchar(36) NOT NULL COMMENT '配送方式ID',
  `logistics_method_name` varchar(100) NOT NULL COMMENT '配送方式名称',
  `logistics_company` varchar(100) DEFAULT NULL COMMENT '物流公司',
  `logistics_no` varchar(100) DEFAULT NULL COMMENT '物流单号',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '物流状态: 0-待发货 1-已发货 2-运输中 3-已签收 4-已取消',
  `recipient_name` varchar(50) NOT NULL COMMENT '收件人姓名',
  `recipient_mobile` varchar(20) NOT NULL COMMENT '收件人手机号',
  `recipient_province` varchar(50) NOT NULL COMMENT '收件人省份',
  `recipient_city` varchar(50) NOT NULL COMMENT '收件人城市',
  `recipient_district` varchar(50) NOT NULL COMMENT '收件人区县',
  `recipient_address` varchar(200) NOT NULL COMMENT '收件人详细地址',
  `recipient_zipcode` varchar(20) DEFAULT NULL COMMENT '收件人邮编',
  `sender_name` varchar(50) DEFAULT NULL COMMENT '发件人姓名',
  `sender_mobile` varchar(20) DEFAULT NULL COMMENT '发件人手机号',
  `sender_province` varchar(50) DEFAULT NULL COMMENT '发件人省份',
  `sender_city` varchar(50) DEFAULT NULL COMMENT '发件人城市',
  `sender_district` varchar(50) DEFAULT NULL COMMENT '发件人区县',
  `sender_address` varchar(200) DEFAULT NULL COMMENT '发件人详细地址',
  `delivery_time` datetime DEFAULT NULL COMMENT '发货时间',
  `receive_time` datetime DEFAULT NULL COMMENT '签收时间',
  `cancel_time` datetime DEFAULT NULL COMMENT '取消时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_sn` (`order_sn`),
  KEY `idx_logistics_no` (`logistics_no`),
  KEY `idx_status` (`status`),
  KEY `idx_delivery_time` (`delivery_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物流订单表';

-- 物流轨迹表
CREATE TABLE IF NOT EXISTS `mall_logistics_track` (
  `id` varchar(36) NOT NULL COMMENT '轨迹ID',
  `logistics_order_id` varchar(36) NOT NULL COMMENT '物流订单ID',
  `order_id` varchar(36) NOT NULL COMMENT '订单ID',
  `logistics_company` varchar(100) DEFAULT NULL COMMENT '物流公司',
  `logistics_no` varchar(100) NOT NULL COMMENT '物流单号',
  `track_time` datetime NOT NULL COMMENT '轨迹时间',
  `track_location` varchar(200) DEFAULT NULL COMMENT '轨迹地点',
  `track_content` varchar(500) NOT NULL COMMENT '轨迹内容',
  `track_operator` varchar(100) DEFAULT NULL COMMENT '操作人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_logistics_order_id` (`logistics_order_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_logistics_no` (`logistics_no`),
  KEY `idx_track_time` (`track_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物流轨迹表';

-- =============================================
-- 售后服务模块 - 表结构
-- =============================================

-- 售后服务表
CREATE TABLE IF NOT EXISTS `mall_after_sale` (
  `id` varchar(36) NOT NULL COMMENT '售后ID',
  `after_sale_sn` varchar(50) NOT NULL COMMENT '售后单号',
  `order_id` varchar(36) NOT NULL COMMENT '订单ID',
  `order_sn` varchar(50) NOT NULL COMMENT '订单编号',
  `member_id` varchar(36) NOT NULL COMMENT '会员ID',
  `member_name` varchar(50) NOT NULL COMMENT '会员名称',
  `type` tinyint(1) NOT NULL COMMENT '售后类型: 1-退货 2-换货 3-维修 4-退款',
  `reason` varchar(200) NOT NULL COMMENT '售后原因',
  `description` text DEFAULT NULL COMMENT '售后描述',
  `images` json DEFAULT NULL COMMENT '售后图片(JSON格式)',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '售后金额',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '售后状态: 0-待审核 1-审核通过 2-审核拒绝 3-待发货 4-已发货 5-已完成 6-已取消',
  `remark` varchar(200) DEFAULT NULL COMMENT '备注',
  `audit_by` varchar(36) DEFAULT NULL COMMENT '审核人ID',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `audit_remark` varchar(200) DEFAULT NULL COMMENT '审核备注',
  `logistics_company` varchar(100) DEFAULT NULL COMMENT '物流公司',
  `logistics_no` varchar(100) DEFAULT NULL COMMENT '物流单号',
  `delivery_time` datetime DEFAULT NULL COMMENT '发货时间',
  `complete_time` datetime DEFAULT NULL COMMENT '完成时间',
  `cancel_time` datetime DEFAULT NULL COMMENT '取消时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_after_sale_sn` (`after_sale_sn`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_sn` (`order_sn`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后服务表';

-- 售后服务商品表
CREATE TABLE IF NOT EXISTS `mall_after_sale_goods` (
  `id` varchar(36) NOT NULL COMMENT '售后商品ID',
  `after_sale_id` varchar(36) NOT NULL COMMENT '售后ID',
  `order_item_id` varchar(36) NOT NULL COMMENT '订单商品项ID',
  `product_id` varchar(36) NOT NULL COMMENT '商品ID',
  `sku_id` varchar(36) NOT NULL COMMENT 'SKU ID',
  `product_name` varchar(200) NOT NULL COMMENT '商品名称',
  `sku_name` varchar(300) NOT NULL COMMENT 'SKU名称',
  `main_image` varchar(500) DEFAULT NULL COMMENT '商品主图',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '商品价格',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '商品数量',
  `refund_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '退款金额',
  `reason` varchar(200) DEFAULT NULL COMMENT '商品售后原因',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_after_sale_id` (`after_sale_id`),
  KEY `idx_order_item_id` (`order_item_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sku_id` (`sku_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后服务商品表';

-- =============================================
-- 反馈系统模块 - 表结构
-- =============================================

-- 用户反馈表
CREATE TABLE IF NOT EXISTS `mall_feedback` (
  `id` varchar(36) NOT NULL COMMENT '反馈ID',
  `member_id` varchar(36) DEFAULT NULL COMMENT '会员ID',
  `member_name` varchar(50) DEFAULT NULL COMMENT '会员名称',
  `contact` varchar(100) DEFAULT NULL COMMENT '联系方式',
  `type` tinyint(1) NOT NULL COMMENT '反馈类型: 1-建议 2-投诉 3-问题 4-其他',
  `title` varchar(200) NOT NULL COMMENT '反馈标题',
  `content` text NOT NULL COMMENT '反馈内容',
  `images` json DEFAULT NULL COMMENT '反馈图片(JSON格式)',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '处理状态: 0-待处理 1-处理中 2-已处理 3-已关闭',
  `remark` varchar(200) DEFAULT NULL COMMENT '备注',
  `processor_id` varchar(36) DEFAULT NULL COMMENT '处理人ID',
  `processor_name` varchar(50) DEFAULT NULL COMMENT '处理人名称',
  `process_time` datetime DEFAULT NULL COMMENT '处理时间',
  `reply_content` text DEFAULT NULL COMMENT '回复内容',
  `reply_time` datetime DEFAULT NULL COMMENT '回复时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户反馈表';

-- 反馈回复表
CREATE TABLE IF NOT EXISTS `mall_feedback_reply` (
  `id` varchar(36) NOT NULL COMMENT '回复ID',
  `feedback_id` varchar(36) NOT NULL COMMENT '反馈ID',
  `reply_content` text NOT NULL COMMENT '回复内容',
  `reply_by` varchar(36) NOT NULL COMMENT '回复人ID',
  `reply_name` varchar(50) NOT NULL COMMENT '回复人名称',
  `reply_type` tinyint(1) NOT NULL COMMENT '回复类型: 1-用户回复 2-管理员回复',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_feedback_id` (`feedback_id`),
  KEY `idx_reply_by` (`reply_by`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反馈回复表';

-- =============================================
-- 系统通知模块 - 表结构
-- =============================================

-- 系统通知表
CREATE TABLE IF NOT EXISTS `mall_system_notice` (
  `id` varchar(36) NOT NULL COMMENT '通知ID',
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text NOT NULL COMMENT '通知内容',
  `type` tinyint(1) NOT NULL COMMENT '通知类型: 1-系统通知 2-活动通知 3-订单通知 4-支付通知 5-售后通知',
  `target_type` tinyint(1) NOT NULL COMMENT '目标类型: 1-所有用户 2-指定用户组 3-指定用户',
  `target_ids` json DEFAULT NULL COMMENT '目标ID列表(JSON格式)',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态: 0-未发布 1-已发布 2-已过期 3-已删除',
  `publish_time` datetime DEFAULT NULL COMMENT '发布时间',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `publisher_id` varchar(36) DEFAULT NULL COMMENT '发布人ID',
  `publisher_name` varchar(50) DEFAULT NULL COMMENT '发布人名称',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_target_type` (`target_type`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_time` (`publish_time`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统通知表';

-- 用户通知表
CREATE TABLE IF NOT EXISTS `mall_user_notice` (
  `id` varchar(36) NOT NULL COMMENT '用户通知ID',
  `notice_id` varchar(36) NOT NULL COMMENT '通知ID',
  `user_id` varchar(36) NOT NULL COMMENT '用户ID',
  `read_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '阅读状态: 0-未读 1-已读',
  `read_time` datetime DEFAULT NULL COMMENT '阅读时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_notice_id` (`notice_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_read_status` (`read_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户通知表';

-- =============================================
-- 数据初始化
-- =============================================

-- 初始化默认会员等级
INSERT IGNORE INTO `mall_member_level` (`id`, `level_name`, `level`, `min_points`, `max_points`, `discount_rate`, `is_default`, `is_show`) VALUES
('1', '普通会员', 1, 0, 999, 100.00, 1, 1),
('2', '白银会员', 2, 1000, 4999, 98.00, 0, 1),
('3', '黄金会员', 3, 5000, 9999, 95.00, 0, 1),
('4', '铂金会员', 4, 10000, 19999, 90.00, 0, 1),
('5', '钻石会员', 5, 20000, 999999, 85.00, 0, 1);

-- 初始化支付方式
INSERT IGNORE INTO `mall_payment_method` (`id`, `name`, `code`, `description`, `status`, `sort_order`) VALUES
('1', '支付宝', 'alipay', '支付宝支付', 1, 1),
('2', '微信支付', 'wechat_pay', '微信支付', 1, 2),
('3', '余额支付', 'balance', '余额支付', 1, 3);

SET FOREIGN_KEY_CHECKS = 1;