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

// 转换为Promise版本的连接池
const promisePool = pool.promise();

async function main() {
  try {
    console.log('开始执行表格重命名操作...');
    
    // 1. 查询所有以li_开头的表格
    const [tables] = await promisePool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name LIKE 'li_%'",
      [process.env.DB_NAME]
    );
    
    console.log(`找到 ${tables.length} 个以 'li_' 开头的表格:`);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.TABLE_NAME}`);
    });
    
    // 如果没有找到表格，直接退出
    if (tables.length === 0) {
      console.log('没有找到需要重命名的表格，操作结束。');
      return;
    }
    
    // 2. 执行表格重命名
    console.log('\n开始执行表格重命名...');
    const renameResults = [];
    
    for (const table of tables) {
      const oldName = table.TABLE_NAME;
      const newName = oldName.replace(/^li_/, 'mall_');
      
      try {
        await promisePool.query(`RENAME TABLE ${oldName} TO ${newName}`);
        renameResults.push({ oldName, newName, success: true });
        console.log(`✓ 成功将 ${oldName} 重命名为 ${newName}`);
      } catch (error) {
        renameResults.push({ oldName, newName, success: false, error: error.message });
        console.error(`✗ 重命名 ${oldName} 失败: ${error.message}`);
      }
    }
    
    // 3. 输出操作结果总结
    console.log('\n操作结果总结:');
    console.log(`总表格数: ${tables.length}`);
    console.log(`成功重命名: ${renameResults.filter(r => r.success).length}`);
    console.log(`重命名失败: ${renameResults.filter(r => !r.success).length}`);
    
    if (renameResults.some(r => !r.success)) {
      console.log('\n失败详情:');
      renameResults.filter(r => !r.success).forEach(r => {
        console.log(`- ${r.oldName} → ${r.newName}: ${r.error}`);
      });
    }
    
    console.log('\n表格重命名操作完成！');
    
  } catch (error) {
    console.error('执行过程中发生错误:', error);
  } finally {
    // 关闭连接池
    pool.end();
  }
}

// 执行主函数
main();