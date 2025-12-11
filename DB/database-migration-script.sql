-- MallEco API版数据库迁移脚本
-- 用于处理现有数据的迁移和表结构变更
-- 创建时间: 2025-12-11
-- 版本: 1.0

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =============================================
-- 表结构变更和标准化
-- =============================================

-- 1. 统一表命名规范
-- 将现有的表名标准化为mall_前缀

-- 重命名订单表 (如果存在旧表名)
RENAME TABLE `orders` TO `mall_order`;
RENAME TABLE `order_items` TO `mall_order_item`;

-- 重命名会员表
RENAME TABLE `members` TO `mall_members`;
RENAME TABLE `member_address` TO `mall_member_address`;

-- 重命名商品表
RENAME TABLE `products` TO `mall_product`;

-- 2. 字段标准化

-- 统一主键为UUID (如果当前是自增ID)
ALTER TABLE `mall_order` MODIFY COLUMN `id` varchar(36) NOT NULL COMMENT '订单ID';
ALTER TABLE `mall_product` MODIFY COLUMN `id` varchar(36) NOT NULL COMMENT '商品ID';
ALTER TABLE `mall_members` MODIFY COLUMN `id` varchar(36) NOT NULL COMMENT '会员ID';

-- 统一金额字段为decimal(12,2)
ALTER TABLE `mall_order` 
MODIFY COLUMN `total_price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '订单总金额',
MODIFY COLUMN `pay_price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '实付金额',
MODIFY COLUMN `freight_price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '运费',
MODIFY COLUMN `discount_price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '优惠金额';

ALTER TABLE `mall_product` 
MODIFY COLUMN `price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '价格',
MODIFY COLUMN `original_price` decimal(12,2) DEFAULT NULL COMMENT '原价';

-- 统一时间字段
ALTER TABLE `mall_order` 
MODIFY COLUMN `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
MODIFY COLUMN `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
MODIFY COLUMN `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
MODIFY COLUMN `shipping_time` datetime DEFAULT NULL COMMENT '发货时间',
MODIFY COLUMN `receive_time` datetime DEFAULT NULL COMMENT '收货时间',
MODIFY COLUMN `finish_time` datetime DEFAULT NULL COMMENT '完成时间';

-- 3. 添加缺失字段

-- 为订单表添加分销相关字段
ALTER TABLE `mall_order` 
ADD COLUMN `distributor_id` varchar(36) DEFAULT NULL COMMENT '分销员ID' AFTER `member_id`,
ADD COLUMN `distribution_commission` decimal(12,2) DEFAULT '0.00' COMMENT '分销佣金' AFTER `distributor_id`,
ADD COLUMN `commission_rate` decimal(5,2) DEFAULT NULL COMMENT '佣金比例' AFTER `distribution_commission`;

-- 为商品表添加营销相关字段
ALTER TABLE `mall_product` 
ADD COLUMN `is_hot` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否热门' AFTER `is_show`,
ADD COLUMN `is_new` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否新品' AFTER `is_hot`,
ADD COLUMN `recommend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐' AFTER `is_new`,
ADD COLUMN `keywords` varchar(200) DEFAULT NULL COMMENT '关键词' AFTER `description`,
ADD COLUMN `weight` decimal(10,3) DEFAULT NULL COMMENT '重量(kg)' AFTER `stock`,
ADD COLUMN `volume` decimal(10,3) DEFAULT NULL COMMENT '体积(m³)' AFTER `weight`;

-- 为会员表添加等级相关字段
ALTER TABLE `mall_members` 
ADD COLUMN `level_id` varchar(36) DEFAULT NULL COMMENT '等级ID' AFTER `status`,
ADD COLUMN `points` int NOT NULL DEFAULT '0' COMMENT '积分' AFTER `level_id`,
ADD COLUMN `growth_value` int NOT NULL DEFAULT '0' COMMENT '成长值' AFTER `points`,
ADD COLUMN `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP' AFTER `growth_value`,
ADD COLUMN `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间' AFTER `last_login_ip`;

-- =============================================
-- 数据迁移和转换
-- =============================================

-- 1. 迁移商品数据到新表结构

-- 创建商品SKU表数据迁移
INSERT INTO `mall_product_sku` (
    `id`, `product_id`, `sku_sn`, `specifications`, `price`, 
    `original_price`, `stock`, `sales`, `image`, `is_default`, `status`
)
SELECT 
    UUID() as id,
    p.id as product_id,
    CONCAT(p.id, '_default') as sku_sn,
    '{}' as specifications,
    p.price,
    p.original_price,
    p.stock,
    p.sales,
    p.main_image as image,
    1 as is_default,
    p.is_show as status
FROM `mall_product` p
WHERE NOT EXISTS (SELECT 1 FROM `mall_product_sku` WHERE product_id = p.id);

-- 2. 迁移会员等级数据

-- 如果会员等级表不存在，创建默认等级数据
INSERT IGNORE INTO `mall_member_level` (`id`, `level_name`, `level`, `min_points`, `max_points`, `discount_rate`, `is_default`, `is_show`) VALUES
('1', '普通会员', 1, 0, 999, 100.00, 1, 1),
('2', '白银会员', 2, 1000, 4999, 98.00, 0, 1),
('3', '黄金会员', 3, 5000, 9999, 95.00, 0, 1),
('4', '铂金会员', 4, 10000, 19999, 90.00, 0, 1),
('5', '钻石会员', 5, 20000, 999999, 85.00, 0, 1);

-- 3. 更新会员等级信息

-- 根据积分设置会员等级
UPDATE `mall_members` m
SET level_id = CASE 
    WHEN m.points >= 20000 THEN '5'
    WHEN m.points >= 10000 THEN '4'
    WHEN m.points >= 5000 THEN '3'
    WHEN m.points >= 1000 THEN '2'
    ELSE '1'
END
WHERE m.level_id IS NULL;

-- 4. 迁移订单数据到分表

-- 创建订单分表数据迁移存储过程
DELIMITER //
CREATE PROCEDURE migrate_orders_to_sharding()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE order_id VARCHAR(36);
    DECLARE member_id VARCHAR(36);
    DECLARE create_time DATETIME;
    DECLARE table_name VARCHAR(50);
    DECLARE cur CURSOR FOR SELECT id, member_id, create_time FROM mall_order;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO order_id, member_id, create_time;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 基于创建年份确定分表
        SET table_name = CONCAT('mall_order_', YEAR(create_time));
        
        -- 检查分表是否存在，不存在则创建
        SET @check_table = CONCAT('SELECT COUNT(*) INTO @table_exists FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ''', table_name, '''');
        PREPARE stmt1 FROM @check_table;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;
        
        IF @table_exists = 0 THEN
            -- 创建分表
            SET @create_sql = CONCAT(
                'CREATE TABLE IF NOT EXISTS ', table_name, ' LIKE mall_order'
            );
            PREPARE stmt2 FROM @create_sql;
            EXECUTE stmt2;
            DEALLOCATE PREPARE stmt2;
        END IF;
        
        -- 迁移数据到分表
        SET @migrate_sql = CONCAT(
            'INSERT IGNORE INTO ', table_name, ' SELECT * FROM mall_order WHERE id = ''', order_id, ''''
        );
        PREPARE stmt3 FROM @migrate_sql;
        EXECUTE stmt3;
        DEALLOCATE PREPARE stmt3;
        
    END LOOP;
    
    CLOSE cur;
END//
DELIMITER ;

-- 执行订单数据迁移
CALL migrate_orders_to_sharding();

-- 删除存储过程
DROP PROCEDURE IF EXISTS migrate_orders_to_sharding;

-- =============================================
-- 数据一致性检查和修复
-- =============================================

-- 1. 检查订单和订单项的一致性
UPDATE `mall_order_item` oi
SET oi.product_id = (
    SELECT p.id FROM `mall_product` p 
    WHERE p.id = oi.product_id 
    LIMIT 1
)
WHERE oi.product_id NOT IN (SELECT id FROM `mall_product`);

-- 2. 修复订单状态数据
UPDATE `mall_order` 
SET order_status = CASE 
    WHEN payment_status = 1 AND shipping_status = 1 THEN 1  -- 待付款
    WHEN payment_status = 2 AND shipping_status = 1 THEN 2  -- 待发货
    WHEN payment_status = 2 AND shipping_status = 2 THEN 3  -- 待收货
    WHEN payment_status = 2 AND shipping_status = 3 THEN 4  -- 已完成
    WHEN payment_status = 3 THEN 5  -- 已取消
    ELSE order_status
END
WHERE order_status IS NULL OR order_status = 0;

-- 3. 修复商品状态数据
UPDATE `mall_product` 
SET is_show = CASE 
    WHEN stock > 0 AND status = 1 THEN 1  -- 上架
    ELSE 0  -- 下架
END
WHERE is_show IS NULL;

-- 4. 修复会员数据
UPDATE `mall_members` 
SET status = CASE 
    WHEN status IS NULL THEN 1  -- 正常
    WHEN status = 0 THEN 2  -- 禁用
    ELSE status
END;

-- =============================================
-- 创建视图和存储过程
-- =============================================

-- 1. 创建商品详情视图
CREATE OR REPLACE VIEW `view_product_detail` AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.stock,
    p.sales,
    p.main_image,
    p.is_show,
    p.is_hot,
    p.is_new,
    p.recommend,
    ps.sku_sn,
    ps.specifications,
    c.name as category_name,
    b.name as brand_name
FROM `mall_product` p
LEFT JOIN `mall_product_sku` ps ON p.id = ps.product_id AND ps.is_default = 1
LEFT JOIN `mall_product_category` c ON p.category_id = c.id
LEFT JOIN `mall_product_brand` b ON p.brand_id = b.id
WHERE p.is_del = 0 AND p.is_show = 1;

-- 2. 创建订单详情视图
CREATE OR REPLACE VIEW `view_order_detail` AS
SELECT 
    o.id,
    o.order_sn,
    o.member_id,
    m.username as member_name,
    o.total_price,
    o.pay_price,
    o.order_status,
    o.payment_status,
    o.shipping_status,
    o.create_time,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity
FROM `mall_order` o
LEFT JOIN `mall_members` m ON o.member_id = m.id
LEFT JOIN `mall_order_item` oi ON o.id = oi.order_id
WHERE o.is_del = 0
GROUP BY o.id, o.order_sn, o.member_id, m.username, o.total_price, o.pay_price, 
         o.order_status, o.payment_status, o.shipping_status, o.create_time;

-- 3. 创建销售统计存储过程
DELIMITER //
CREATE PROCEDURE `sp_sales_statistics`(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        DATE(o.create_time) as stat_date,
        COUNT(DISTINCT o.id) as order_count,
        COUNT(DISTINCT o.member_id) as member_count,
        SUM(o.pay_price) as total_amount,
        AVG(o.pay_price) as avg_amount
    FROM `mall_order` o
    WHERE DATE(o.create_time) BETWEEN start_date AND end_date
    AND o.order_status IN (2, 3, 4)  -- 已付款、已发货、已完成
    GROUP BY DATE(o.create_time)
    ORDER BY stat_date;
END//
DELIMITER ;

-- =============================================
-- 数据库权限和安全性设置
-- =============================================

-- 1. 创建只读用户
CREATE USER IF NOT EXISTS 'malleco_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON `malleco`.* TO 'malleco_readonly'@'%';

-- 2. 创建读写用户
CREATE USER IF NOT EXISTS 'malleco_rw'@'%' IDENTIFIED BY 'rw_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON `malleco`.* TO 'malleco_rw'@'%';

-- 3. 刷新权限
FLUSH PRIVILEGES;

-- =============================================
-- 迁移完成检查和验证
-- =============================================

-- 1. 检查表数量
SELECT 
    COUNT(*) as table_count,
    COUNT(DISTINCT TABLE_NAME) as distinct_tables
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name LIKE 'mall_%';

-- 2. 检查数据完整性
SELECT 
    '订单表' as table_name,
    COUNT(*) as record_count
FROM mall_order
UNION ALL
SELECT 
    '商品表',
    COUNT(*)
FROM mall_product
UNION ALL
SELECT 
    '会员表',
    COUNT(*)
FROM mall_members
UNION ALL
SELECT 
    'SKU表',
    COUNT(*)
FROM mall_product_sku;

-- 3. 检查索引状态
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name LIKE 'mall_%'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 迁移完成提示
-- =============================================

SELECT '数据库迁移完成！' as message;
SELECT '请检查以上查询结果，确保数据迁移成功。' as note;
SELECT '建议执行以下操作：' as suggestion;
SELECT '1. 备份数据库' as step1;
SELECT '2. 测试应用功能' as step2;
SELECT '3. 监控数据库性能' as step3;
SELECT '4. 优化数据库参数' as step4;