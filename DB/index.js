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
