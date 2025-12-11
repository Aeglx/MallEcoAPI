const path = require('path');
const { spawn } = require('child_process');

/**
 * 项目启动时自动执行的数据库初始化脚本
 * 新项目：自动创建数据库和所有表
 * 旧项目：检测并创建缺失的表
 */

async function initializeDatabase() {
  console.log('🚀 MallEco API 数据库初始化...');
  
  const dbManagerPath = path.join(__dirname, '../DB/database-manager.js');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', [dbManagerPath, 'init'], {
      stdio: 'inherit',
      cwd: path.dirname(dbManagerPath)
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 数据库初始化完成');
        resolve(true);
      } else {
        console.error('❌ 数据库初始化失败');
        reject(new Error(`数据库初始化失败，退出码: ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ 启动数据库初始化进程失败:', error.message);
      reject(error);
    });
  });
}

/**
 * 数据库健康检查
 */
async function checkDatabaseHealth() {
  console.log('🏥 检查数据库健康状态...');
  
  const dbManagerPath = path.join(__dirname, '../DB/database-manager.js');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', [dbManagerPath, 'check'], {
      stdio: 'inherit',
      cwd: path.dirname(dbManagerPath)
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 数据库健康检查通过');
        resolve(true);
      } else {
        console.error('❌ 数据库健康检查失败');
        resolve(false); // 健康检查失败不阻止应用启动
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ 启动数据库健康检查进程失败:', error.message);
      resolve(false); // 健康检查失败不阻止应用启动
    });
  });
}

/**
 * 在应用启动时自动执行数据库初始化
 */
if (require.main === module) {
  // 命令行直接运行
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('数据库初始化错误:', error.message);
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase,
  checkDatabaseHealth
};