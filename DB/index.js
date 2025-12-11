#!/usr/bin/env node

/**
 * MallEco API 统一数据库管理入口
 * 简化数据库管理操作，提供友好的命令行界面
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 MallEco API 数据库管理工具');
console.log('='.repeat(50));

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    showUsage();
    return;
  }

  try {
    switch (command) {
      case 'setup':
        console.log('\n📦 开始新项目数据库初始化...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} init`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'health':
        console.log('\n🏥 开始数据库健康检查...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} health`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'upgrade':
        console.log('\n🔄 开始数据库版本升级...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} version`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'status':
        console.log('\n📊 查看数据库状态...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} current`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'tables':
        console.log('\n📋 查看数据库表列表...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} tables`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'history':
        console.log('\n📜 查看数据库版本历史...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} history`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'optimize':
        console.log('\n⚡ 开始数据库性能优化...');
        execSync(`node ${path.join(__dirname, 'database-manager.js')} optimize`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        break;

      case 'help':
      case '--help':
      case '-h':
        showUsage();
        break;

      default:
        console.log(`\n❌ 未知命令: ${command}`);
        showUsage();
        break;
    }
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    process.exit(1);
  }
}

// 显示使用说明
function showUsage() {
  console.log(`
📖 使用方法:
  node index.js [command]

🔧 核心管理命令:
  setup     - 新项目初始化（推荐新项目使用）
  health    - 数据库健康检查
  upgrade   - 升级数据库到最新版本
  status    - 查看当前数据库状态
  optimize  - 优化数据库性能

📋 辅助命令:
  tables    - 查看所有数据表
  history   - 查看版本历史
  help      - 显示此帮助信息

💡 使用示例:
  node index.js setup    # 新项目部署
  node index.js health   # 日常健康检查
  node index.js upgrade  # 版本升级
  node index.js status   # 查看状态

🔍 快速检查命令:
  npm run db:health    # 在package.json中配置
  npm run db:upgrade   # 在package.json中配置

📝 注意:
  - 确保数据库服务正在运行
  - 检查config/.env中的数据库配置
  - 生产环境建议先备份数据再执行升级
`);
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序执行失败:', error);
    process.exit(1);
  });
}

module.exports = { main };