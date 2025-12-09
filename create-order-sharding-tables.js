const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '.env'),
});

async function createOrderShardingTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'malleco',
  });

  try {
    // 预定义订单表结构
    const tableStructure = `(
      \`id\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`createBy\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`createTime\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updateBy\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`updateTime\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`deleteFlag\` tinyint NULL DEFAULT 0,
      \`sn\` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`memberId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`storeId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`supplierId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`orderStatus\` tinyint NOT NULL DEFAULT 0,
      \`payStatus\` tinyint NOT NULL DEFAULT 0,
      \`shipStatus\` tinyint NOT NULL DEFAULT 0,
      \`afterSaleStatus\` tinyint NOT NULL DEFAULT 0,
      \`consigneeName\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`consigneeMobile\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`consigneeProvince\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`consigneeCity\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`consigneeDistrict\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`consigneeAddressId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`consigneeAddressIdPath\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`consigneeDetail\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`flowPrice\` double NOT NULL,
      \`goodsPrice\` double NOT NULL,
      \`freightPrice\` double NOT NULL,
      \`discountPrice\` double NOT NULL,
      \`updatePrice\` double NULL DEFAULT NULL,
      \`logisticsNo\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`logisticsCode\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`logisticsName\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`weight\` double NULL DEFAULT NULL,
      \`goodsNum\` int NOT NULL,
      \`remark\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
      \`sellerRemark\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
      \`cancelReason\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`completeTime\` datetime NULL DEFAULT NULL,
      \`logisticsTime\` datetime NULL DEFAULT NULL,
      \`payOrderNo\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`clientType\` enum('PC','MOBILE','APP','WECHAT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`needReceipt\` tinyint NOT NULL DEFAULT 0,
      \`parentOrderSn\` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
      \`promotionId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`orderType\` enum('NORMAL','VIRTUAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
      \`orderPromotionType\` enum('NORMAL','PINTUAN','COUPON','POINT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
      \`priceDetail\` json NULL,
      \`canReturn\` tinyint NOT NULL DEFAULT 1,
      \`verificationCode\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`distributionId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`useStoreMemberCouponIds\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`usePlatformMemberCouponId\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`qrCode\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`storeAddressPath\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`storeAddressMobile\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      \`storeAddressCenter\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`) USING BTREE,
      UNIQUE INDEX \`uk_order_sn\` (\`sn\`) USING BTREE,
      INDEX \`idx_member_id\` (\`memberId\`) USING BTREE,
      INDEX \`idx_store_id\` (\`storeId\`) USING BTREE,
      INDEX \`idx_order_status\` (\`orderStatus\`) USING BTREE,
      INDEX \`idx_pay_status\` (\`payStatus\`) USING BTREE,
      INDEX \`idx_ship_status\` (\`shipStatus\`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;
    `;

    // 生成创建表的SQL语句
    for (let i = 0; i < 16; i++) {
      const tableIndex = i.toString().padStart(2, '0');
      const tableName = `mall_order_${tableIndex}`;

      // 创建表
      const createTableSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` ${tableStructure}`;

      // 执行创建表
      await connection.execute(createTableSql);
      console.log(`Created table: ${tableName}`);
    }

    console.log('All order sharding tables created successfully!');
  } catch (error) {
    console.error('Error creating order sharding tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行脚本
createOrderShardingTables().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
