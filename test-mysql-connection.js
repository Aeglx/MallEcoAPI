const mysql = require('mysql2');
const dotenv = require('dotenv');

// 加载.env文件中的环境变量
dotenv.config();

// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
pool.getConnection((err, connection) => {
  if (err) {
    console.error('无法连接到MySQL数据库:', err);
    process.exit(1);
  }
  
  console.log('成功连接到MySQL数据库！');
  
  // 测试查询
  connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    connection.release();
    
    if (error) {
      console.error('查询失败:', error);
      process.exit(1);
    }
    
    console.log('查询结果:', results);
    console.log('MySQL连接测试成功！');
    process.exit(0);
  });
});