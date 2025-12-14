const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('正在测试数据库连接...');
  try {
    // 使用与应用程序相同的配置
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'qwerty123',
      database: 'malleco'
    });
    
    console.log('✅ 数据库连接成功！');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('📊 查询结果:', rows[0].result);
    
    await connection.end();
    console.log('🔌 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误:', error);
  }
}

testConnection();