const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '../config', '.env'),
});

async function executeSqlScript() {
  // 创建数据库连接
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'malleco',
  });

  try {
    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'create-order-sharding.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL script...');
    
    // 执行SQL脚本
    await connection.query(sqlContent);
    
    console.log('SQL script executed successfully! All order sharding tables created.');
  } catch (error) {
    console.error('Error executing SQL script:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行脚本
executeSqlScript().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
