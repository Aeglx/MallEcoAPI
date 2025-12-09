-- 创建订单分表的SQL脚本
-- 基于mall_order表结构创建16个分表

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- 循环创建16个分表
DELIMITER //
CREATE PROCEDURE create_order_sharding_tables()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE table_name VARCHAR(50);
    
    WHILE i < 16 DO
        -- 生成表名，如mall_order_00, mall_order_01, ..., mall_order_15
        SET table_name = CONCAT('mall_order_', LPAD(i, 2, '0'));
        
        -- 创建表
        SET @sql = CONCAT(
            'CREATE TABLE IF NOT EXISTS ', table_name, ' (
                `id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `createBy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updateBy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `deleteFlag` tinyint NULL DEFAULT 0,
                `sn` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `memberId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `storeId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `supplierId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `orderStatus` tinyint NOT NULL DEFAULT 0,
                `payStatus` tinyint NOT NULL DEFAULT 0,
                `shipStatus` tinyint NOT NULL DEFAULT 0,
                `afterSaleStatus` tinyint NOT NULL DEFAULT 0,
                `consigneeName` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `consigneeMobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `consigneeProvince` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `consigneeCity` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `consigneeDistrict` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `consigneeAddressId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `consigneeAddressIdPath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `consigneeDetail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `flowPrice` double NOT NULL,
                `goodsPrice` double NOT NULL,
                `freightPrice` double NOT NULL,
                `discountPrice` double NOT NULL,
                `updatePrice` double NULL DEFAULT NULL,
                `logisticsNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `logisticsCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `logisticsName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `weight` double NULL DEFAULT NULL,
                `goodsNum` int NOT NULL,
                `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                `sellerRemark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                `cancelReason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `completeTime` datetime NULL DEFAULT NULL,
                `logisticsTime` datetime NULL DEFAULT NULL,
                `payOrderNo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `clientType` enum('PC','MOBILE','APP','WECHAT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `needReceipt` tinyint NOT NULL DEFAULT 0,
                `parentOrderSn` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                `promotionId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `orderType` enum('NORMAL','VIRTUAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
                `orderPromotionType` enum('NORMAL','PINTUAN','COUPON','POINT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
                `priceDetail` json NULL,
                `canReturn` tinyint NOT NULL DEFAULT 1,
                `verificationCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `distributionId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `useStoreMemberCouponIds` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `usePlatformMemberCouponId` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `qrCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `storeAddressPath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `storeAddressMobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                `storeAddressCenter` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                PRIMARY KEY (`id`) USING BTREE,
                UNIQUE INDEX `uk_order_sn` (`sn`) USING BTREE,
                INDEX `idx_member_id` (`memberId`) USING BTREE,
                INDEX `idx_store_id` (`storeId`) USING BTREE,
                INDEX `idx_order_status` (`orderStatus`) USING BTREE,
                INDEX `idx_pay_status` (`payStatus`) USING BTREE,
                INDEX `idx_ship_status` (`shipStatus`) USING BTREE
            ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;'
        );
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;

-- 执行存储过程创建分表
CALL create_order_sharding_tables();

-- 删除存储过程
DROP PROCEDURE IF EXISTS create_order_sharding_tables;

SET FOREIGN_KEY_CHECKS = 1;
