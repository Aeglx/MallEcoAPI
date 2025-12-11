-- MallEco API版数据库索引优化和分表策略脚本
-- 创建时间: 2025-12-11
-- 版本: 1.0

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =============================================
-- 索引优化策略
-- =============================================

-- 1. 商品表索引优化
ALTER TABLE `mall_product` 
ADD INDEX `idx_product_category_show` (`category_id`, `is_show`),
ADD INDEX `idx_product_price_sales` (`price`, `sales`),
ADD INDEX `idx_product_search` (`name`(50), `keywords`(50)),
ADD INDEX `idx_product_time_status` (`created_at`, `is_show`),
ADD INDEX `idx_product_brand_category` (`brand_id`, `category_id`),
ADD INDEX `idx_product_sales_time` (`sales`, `created_at`);

-- 2. 订单表索引优化
ALTER TABLE `mall_order` 
ADD INDEX `idx_order_member_time` (`member_id`, `created_at`),
ADD INDEX `idx_order_status_payment` (`order_status`, `payment_status`),
ADD INDEX `idx_order_time_status` (`created_at`, `order_status`),
ADD INDEX `idx_order_store_status` (`store_id`, `order_status`),
ADD INDEX `idx_order_payment_time` (`payment_status`, `pay_time`),
ADD INDEX `idx_order_sn` (`order_sn`),
ADD INDEX `idx_order_member_status` (`member_id`, `order_status`, `payment_status`);

-- 3. 会员表索引优化
ALTER TABLE `mall_members` 
ADD INDEX `idx_member_phone` (`phone`),
ADD INDEX `idx_member_email` (`email`),
ADD INDEX `idx_member_create_time` (`create_time`),
ADD INDEX `idx_member_status_time` (`status`, `create_time`),
ADD INDEX `idx_member_level_status` (`level_id`, `status`);

-- 4. 订单项表索引优化
ALTER TABLE `order_item` 
ADD INDEX `idx_item_order_product` (`order_id`, `product_id`),
ADD INDEX `idx_item_product_time` (`product_id`, `create_time`),
ADD INDEX `idx_item_sku_time` (`sku_id`, `create_time`);

-- 5. 搜索相关表索引优化
ALTER TABLE `mall_search_history` 
ADD INDEX `idx_search_member_time` (`member_id`, `create_time`),
ADD INDEX `idx_search_keyword_time` (`keyword`, `create_time`);

ALTER TABLE `mall_hot_words` 
ADD INDEX `idx_hot_words_count` (`search_count`),
ADD INDEX `idx_hot_words_time` (`create_time`);

-- 6. 分销相关表索引优化
ALTER TABLE `li_distribution` 
ADD INDEX `idx_distribution_member_status` (`member_id`, `distribution_status`),
ADD INDEX `idx_distribution_status_time` (`distribution_status`, `create_time`),
ADD INDEX `idx_distribution_rebate_total` (`rebate_total`),
ADD INDEX `idx_distribution_order_count` (`distribution_order_count`);

-- 7. 支付相关表索引优化
ALTER TABLE `payment` 
ADD INDEX `idx_payment_order_status` (`order_id`, `status`),
ADD INDEX `idx_payment_time_status` (`create_time`, `status`),
ADD INDEX `idx_payment_method_time` (`payment_method`, `create_time`);

-- 8. 钱包相关表索引优化
ALTER TABLE `wallet` 
ADD INDEX `idx_wallet_member_balance` (`member_id`, `balance`),
ADD INDEX `idx_wallet_time_status` (`create_time`, `status`);

-- =============================================
-- 动态分表策略
-- =============================================

-- 1. 基于时间的订单分表策略
DELIMITER //
CREATE PROCEDURE create_order_sharding_tables_by_time()
BEGIN
    DECLARE current_year INT DEFAULT YEAR(NOW());
    DECLARE start_year INT DEFAULT 2024;
    DECLARE end_year INT DEFAULT current_year + 1;
    DECLARE i INT DEFAULT start_year;
    
    WHILE i <= end_year DO
        -- 创建年度分表
        SET @table_name = CONCAT('mall_order_', i);
        SET @sql = CONCAT(
            'CREATE TABLE IF NOT EXISTS ', @table_name, ' (
                `id` varchar(36) NOT NULL COMMENT ''订单ID'',
                `order_sn` varchar(32) NOT NULL COMMENT ''订单编号'',
                `member_id` varchar(36) NOT NULL COMMENT ''会员ID'',
                `store_id` varchar(36) NOT NULL COMMENT ''店铺ID'',
                `total_price` decimal(12,2) NOT NULL DEFAULT ''0.00'' COMMENT ''订单总金额'',
                `pay_price` decimal(12,2) NOT NULL DEFAULT ''0.00'' COMMENT ''实付金额'',
                `order_status` tinyint(1) NOT NULL DEFAULT ''1'' COMMENT ''订单状态'',
                `payment_status` tinyint(1) NOT NULL DEFAULT ''1'' COMMENT ''支付状态'',
                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
                `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''更新时间'',
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_order_sn` (`order_sn`),
                INDEX `idx_member_time` (`member_id`, `create_time`),
                INDEX `idx_status_time` (`order_status`, `create_time`),
                INDEX `idx_create_time` (`create_time`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''订单表_', i, ''''
        );
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;

-- 2. 基于用户ID哈希的订单分表策略
DELIMITER //
CREATE PROCEDURE create_order_sharding_tables_by_hash()
BEGIN
    DECLARE i INT DEFAULT 0;
    
    WHILE i < 16 DO
        -- 创建哈希分表
        SET @table_name = CONCAT('mall_order_hash_', LPAD(i, 2, '0'));
        SET @sql = CONCAT(
            'CREATE TABLE IF NOT EXISTS ', @table_name, ' (
                `id` varchar(36) NOT NULL COMMENT ''订单ID'',
                `order_sn` varchar(32) NOT NULL COMMENT ''订单编号'',
                `member_id` varchar(36) NOT NULL COMMENT ''会员ID'',
                `store_id` varchar(36) NOT NULL COMMENT ''店铺ID'',
                `total_price` decimal(12,2) NOT NULL DEFAULT ''0.00'' COMMENT ''订单总金额'',
                `pay_price` decimal(12,2) NOT NULL DEFAULT ''0.00'' COMMENT ''实付金额'',
                `order_status` tinyint(1) NOT NULL DEFAULT ''1'' COMMENT ''订单状态'',
                `payment_status` tinyint(1) NOT NULL DEFAULT ''1'' COMMENT ''支付状态'',
                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
                `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''更新时间'',
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_order_sn` (`order_sn`),
                INDEX `idx_member_time` (`member_id`, `create_time`),
                INDEX `idx_status_time` (`order_status`, `create_time`),
                INDEX `idx_create_time` (`create_time`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''订单哈希分表_', i, ''''
        );
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;

-- 3. 商品SKU分表策略
DELIMITER //
CREATE PROCEDURE create_product_sku_sharding_tables()
BEGIN
    DECLARE i INT DEFAULT 0;
    
    WHILE i < 8 DO
        -- 创建SKU分表
        SET @table_name = CONCAT('mall_product_sku_', LPAD(i, 2, '0'));
        SET @sql = CONCAT(
            'CREATE TABLE IF NOT EXISTS ', @table_name, ' (
                `id` varchar(36) NOT NULL COMMENT ''SKU ID'',
                `product_id` varchar(36) NOT NULL COMMENT ''商品ID'',
                `sku_sn` varchar(50) NOT NULL COMMENT ''SKU编号'',
                `price` decimal(12,2) NOT NULL DEFAULT ''0.00'' COMMENT ''价格'',
                `stock` int NOT NULL DEFAULT ''0'' COMMENT ''库存数量'',
                `sales` int NOT NULL DEFAULT ''0'' COMMENT ''销量'',
                `status` tinyint(1) NOT NULL DEFAULT ''1'' COMMENT ''状态'',
                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
                `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''更新时间'',
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_sku_sn` (`sku_sn`),
                INDEX `idx_product_id` (`product_id`),
                INDEX `idx_price_stock` (`price`, `stock`),
                INDEX `idx_sales_time` (`sales`, `create_time`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''商品SKU分表_', i, ''''
        );
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;

-- =============================================
-- 执行存储过程创建分表
-- =============================================

-- 执行时间分表创建
CALL create_order_sharding_tables_by_time();

-- 执行哈希分表创建
CALL create_order_sharding_tables_by_hash();

-- 执行SKU分表创建
CALL create_product_sku_sharding_tables();

-- 删除存储过程
DROP PROCEDURE IF EXISTS create_order_sharding_tables_by_time;
DROP PROCEDURE IF EXISTS create_order_sharding_tables_by_hash;
DROP PROCEDURE IF EXISTS create_product_sku_sharding_tables;

-- =============================================
-- 数据库参数优化
-- =============================================

-- 1. 查询缓存优化
SET GLOBAL query_cache_size = 134217728; -- 128MB
SET GLOBAL query_cache_type = 1;

-- 2. 连接参数优化
SET GLOBAL max_connections = 1000;
SET GLOBAL thread_cache_size = 64;
SET GLOBAL table_open_cache = 2000;

-- 3. InnoDB参数优化
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
SET GLOBAL innodb_log_file_size = 134217728; -- 128MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL innodb_flush_method = O_DIRECT;

-- 4. 临时表优化
SET GLOBAL tmp_table_size = 67108864; -- 64MB
SET GLOBAL max_heap_table_size = 67108864; -- 64MB

-- =============================================
-- 索引维护脚本
-- =============================================

-- 1. 索引碎片整理
DELIMITER //
CREATE PROCEDURE optimize_indexes()
BEGIN
    -- 分析表以更新索引统计信息
    ANALYZE TABLE 
        mall_product, 
        mall_order, 
        mall_members, 
        order_item, 
        mall_search_history, 
        li_distribution, 
        payment, 
        wallet;
    
    -- 优化表以整理碎片
    OPTIMIZE TABLE 
        mall_product, 
        mall_order, 
        mall_members, 
        order_item, 
        mall_search_history, 
        li_distribution, 
        payment, 
        wallet;
END//
DELIMITER ;

-- 2. 定期索引维护任务
-- 建议每天凌晨执行以下SQL
-- CALL optimize_indexes();

SET FOREIGN_KEY_CHECKS = 1;