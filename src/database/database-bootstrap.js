const DatabaseManager = require('../../DB/database-manager');
const DatabaseVersionManager = require('../../DB/database-version-manager');

/**
 * 应用启动时的数据库自动初始化
 * 此模块应该在其他模块之前加载，确保数据库就绪
 */

class DatabaseBootstrap {
  constructor() {
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5秒
  }

  /**
   * 异步初始化数据库
   */
  async initialize() {
    if (this.initialized) {
      console.log('✅ 数据库已经初始化过，跳过重复初始化');
      return true;
    }

    console.log('🚀 开始应用启动时的数据库初始化...');

    try {
      // 1. 使用版本管理器进行智能更新
      const versionManager = new DatabaseVersionManager();
      
      // 健康检查
      const health = await versionManager.healthCheck();
      
      if (!health.healthy) {
        console.log('⚠️ 数据库健康检查异常，尝试自动修复...');
        
        // 使用基础管理器进行修复
        const dbManager = new DatabaseManager();
        if (await dbManager.connect()) {
          await dbManager.initializeDatabase({
            createMissingTables: true,
            optimizeIndexes: false,
            renameLegacyTables: false
          });
          await dbManager.disconnect();
        }
      }

      // 2. 执行版本更新
      const updateSuccess = await versionManager.updateDatabase();
      
      if (updateSuccess) {
        console.log('✅ 数据库版本更新完成');
        this.initialized = true;
        return true;
      } else {
        console.warn('⚠️ 数据库版本更新可能存在问题，但应用将继续启动');
        this.initialized = true; // 标记为已初始化，避免重复尝试
        return true; // 更新失败不阻止应用启动
      }
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      
      // 重试机制
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 等待 ${this.retryDelay / 1000} 秒后重试 (${this.retryCount}/${this.maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return await this.initialize(); // 递归重试
      }
      
      console.error(`❌ 数据库初始化失败，已达到最大重试次数 (${this.maxRetries})`);
      
      // 如果数据库完全不可用，可以选择抛出错误阻止应用启动
      // 或者返回false让应用决定如何处理
      return false;
    }
  }

  /**
   * 快速健康检查（不进行初始化）
   */
  async quickHealthCheck() {
    try {
      const versionManager = new DatabaseVersionManager();
      const health = await versionManager.healthCheck();
      return health.healthy;
    } catch (error) {
      console.error('❌ 快速健康检查失败:', error.message);
      return false;
    }
  }

  /**
   * 获取初始化状态
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 重置初始化状态（用于测试）
   */
  reset() {
    this.initialized = false;
    this.retryCount = 0;
  }
}

// 创建全局单例实例
const databaseBootstrap = new DatabaseBootstrap();

/**
 * 应用启动时自动执行的数据库初始化
 * 此函数应该在应用入口文件的最开始调用
 */
async function initializeDatabaseOnStartup() {
  // 如果设置了环境变量跳过数据库初始化（用于测试等场景）
  if (process.env.SKIP_DB_INITIALIZATION === 'true') {
    console.log('⚠️ 跳过数据库初始化 (SKIP_DB_INITIALIZATION=true)');
    return true;
  }

  // 检查是否在Docker环境中
  const isDocker = process.env.DOCKER_ENV === 'true' || process.env.IN_DOCKER === 'true';
  
  if (isDocker) {
    console.log('🐳 Docker环境检测到，增加数据库连接等待时间...');
    // 在Docker环境中，数据库可能启动较慢，增加等待
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  return await databaseBootstrap.initialize();
}

/**
 * 中间件：确保数据库已初始化
 * 可以用于Express等框架的中间件
 */
function ensureDatabaseInitialized() {
  return async (req, res, next) => {
    if (!databaseBootstrap.isInitialized()) {
      // 如果数据库未初始化，尝试初始化
      const success = await databaseBootstrap.initialize();
      
      if (!success) {
        return res.status(503).json({
          error: '数据库未就绪',
          message: '系统正在初始化数据库，请稍后重试'
        });
      }
    }
    
    next();
  };
}

/**
 * 健康检查端点
 */
function healthCheckEndpoint() {
  return async (req, res) => {
    try {
      const healthy = await databaseBootstrap.quickHealthCheck();
      
      if (healthy) {
        res.json({
          status: 'healthy',
          database: 'connected',
          initialized: databaseBootstrap.isInitialized(),
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          database: 'disconnected',
          initialized: databaseBootstrap.isInitialized(),
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = {
  databaseBootstrap,
  initializeDatabaseOnStartup,
  ensureDatabaseInitialized,
  healthCheckEndpoint,
  
  // 导出单例实例
  getInstance: () => databaseBootstrap
};