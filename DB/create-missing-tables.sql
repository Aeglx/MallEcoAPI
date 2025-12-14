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
-- 数据初始化
-- =============================================

-- 初始化默认会员等级
INSERT IGNORE INTO `mall_member_level` (`id`, `level_name`, `level`, `min_points`, `max_points`, `discount_rate`, `is_default`, `is_show`) VALUES
('1', '普通会员', 1, 0, 999, 100.00, 1, 1),
('2', '白银会员', 2, 1000, 4999, 98.00, 0, 1),
('3', '黄金会员', 3, 5000, 9999, 95.00, 0, 1),
('4', '铂金会员', 4, 10000, 19999, 90.00, 0, 1),
('5', '钻石会员', 5, 20000, 999999, 85.00, 0, 1);

SET FOREIGN_KEY_CHECKS = 1;