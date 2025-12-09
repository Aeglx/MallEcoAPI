const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '../config', '.env'),
});

async function checkTables() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('数据库连接成功');

    // 查询所有表名
    const [tables] = await connection.query("SHOW TABLES");
    console.log('数据库表列表:');
    tables.forEach((table) => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });

    // 检查搜索相关表的结构
    const searchTables = ['hot_words', 'search_history', 'mall_hot_words', 'mall_search_history'];
    
    for (const tableName of searchTables) {
      try {
        const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
        console.log(`\n表 ${tableName} 的结构:`);
        columns.forEach((column) => {
          console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''} ${column.Key}`);
        });
      } catch (error) {
        console.log(`\n表 ${tableName} 不存在`);
      }
    }

    // 关闭连接
    await connection.end();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

checkTables();
