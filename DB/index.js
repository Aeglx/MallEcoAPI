/**
 * 数据库管理模块入口文件
 */

const DatabaseManager = require('./database-manager');

// 导出数据库管理器
module.exports = {
  DatabaseManager,
  // 创建默认实例
  databaseManager: new DatabaseManager()
};

// 提供便捷的初始化函数
module.exports.initializeDatabase = async () => {
  const manager = new DatabaseManager();
  return await manager.initialize();
};

// 提供便捷的连接检查函数
module.exports.checkDatabaseConnection = async () => {
  const manager = new DatabaseManager();
  return await manager.checkConnection();
};

// 提供便捷的数据库信息获取函数
module.exports.getDatabaseInfo = async () => {
  const manager = new DatabaseManager();
  return await manager.getDatabaseInfo();
};

// 命令行接口
if (require.main === module) {
  const command = process.argv[2];
  const manager = new DatabaseManager();

  async function runCommand() {
    try {
      switch (command) {
        case 'init':
        case 'initialize':
          console.log('🚀 开始初始化数据库...\n');
          await manager.initialize();
          process.exit(0);
          break;

        case 'check':
        case 'health':
          console.log('🔍 检查数据库连接...\n');
          const isConnected = await manager.checkConnection();
          if (isConnected) {
            console.log('✅ 数据库连接正常');
            const info = await manager.getDatabaseInfo();
            console.log(`📊 数据库信息:`, info);
          } else {
            console.log('❌ 数据库连接失败');
            process.exit(1);
          }
          break;

        case 'info':
        case 'status':
          console.log('📊 获取数据库信息...\n');
          const dbInfo = await manager.getDatabaseInfo();
          console.log('数据库信息:', dbInfo);
          break;

        default:
          console.log('📖 数据库管理工具使用说明：\n');
          console.log('用法: node DB/index.js <command>\n');
          console.log('可用命令:');
          console.log('  init, initialize  - 初始化数据库（创建数据库、表结构和初始数据）');
          console.log('  check, health    - 检查数据库连接状态');
          console.log('  info, status     - 获取数据库信息');
          console.log('\n示例:');
          console.log('  node DB/index.js init      # 初始化数据库');
          console.log('  node DB/index.js check     # 检查连接');
          console.log('  node DB/index.js info       # 获取信息');
          process.exit(0);
      }
    } catch (error) {
      console.error('❌ 执行失败:', error.message);
      process.exit(1);
    }
  }

  runCommand();
}