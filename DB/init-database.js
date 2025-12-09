const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '../config', '.env'),
});

// 将exec转换为Promise
const execAsync = util.promisify(exec);

async function initDatabase() {
  try {
    // 1. 获取数据库连接配置
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: '', // 不指定数据库，先连接到MySQL服务器
    };

    // 2. 连接到MySQL服务器
    console.log('正在连接到MySQL服务器...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('MySQL服务器连接成功');

    // 3. 创建数据库（如果不存在）
    const databaseName = process.env.DB_NAME || 'malleco';
    console.log(`正在检查并创建数据库: ${databaseName}...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`数据库 ${databaseName} 创建或已存在`);

    // 5. 选择创建的数据库
    await connection.query(`USE \`${databaseName}\`;`);
    console.log(`已切换到数据库: ${databaseName}`);

    // 6. 关闭连接
    await connection.end();

    // 6. 执行现有的数据库脚本
    console.log('\n开始执行数据库表创建脚本...');



    // 执行搜索表创建脚本
    console.log('\n执行搜索表创建脚本:');
    await execAsync('node create-search-tables.js', { cwd: __dirname });

    // 执行订单分表创建脚本
    console.log('\n执行订单分表创建脚本:');
    await execAsync('node create-order-sharding-tables.js', { cwd: __dirname });

    // 7. 提示完成
    console.log('\n🎉 数据库初始化完成！');
    console.log(`\n数据库 ${databaseName} 已创建，并且所有数据表已初始化完成。`);
    console.log('您可以通过以下命令启动应用:');
    console.log('  npm run start:dev');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error('详细错误信息:', error);
    process.exit(1);
  }
}

// 执行初始化脚本
initDatabase();