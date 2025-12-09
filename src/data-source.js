const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '../.env'),
});

// 创建数据源配置
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'malleco',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  entities: [
    // 导入所有需要的实体
    path.join(__dirname, '../modules/**/*.entity.js'),
    path.join(__dirname, '../common/**/*.entity.js'),
    path.join(__dirname, './**/*.entity.js'),
  ],
  migrations: [
    // 迁移文件位置
    path.join(__dirname, '../modules/common/order/sharding/*.migration.js'),
  ],
  synchronize: false, // 不使用自动同步，使用迁移
  logging: process.env.DB_LOGGING === 'true',
  // 数据库连接池配置
  extra: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    waitForConnections: true,
    queueLimit: 0,
  },
});

module.exports = {
  AppDataSource,
};
