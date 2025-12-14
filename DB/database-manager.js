const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '../config', '.env'),
});

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'malleco',
    };
    
    // 数据库版本信息
    this.versionTableName = 'mall_database_version';
    this.versions = [
      {
        version: '1.0.0',
        description: '初始版本 - 基础表结构',
        sqlFile: 'create-missing-tables.sql',
        requiredTables: ['mall_members', 'mall_product', 'mall_order']
      },
      {
        version: '1.1.0',
        description: '性能优化 - 索引和表结构',
        sqlFile: 'optimize-indexes-tables.sql',
        requiredTables: [] // 纯优化，不新增表
      }
    ];
  }

  /**
   * 创建数据库连接
   */
  async connect() {
    try {
      this.connection = await mysql.createConnection(this.dbConfig);
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      if (error.code === 'ER_BAD_DB_ERROR') {
        console.log('📁 数据库不存在，尝试创建数据库...');
        return await this.ensureDatabase();
      }
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  /**
   * 关闭数据库连接
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }

  /**
   * 检查数据库是否存在，不存在则创建
   */
  async ensureDatabase() {
    try {
      // 先连接到MySQL服务器（不指定数据库）
      const tempConfig = { ...this.dbConfig };
      delete tempConfig.database;
      
      const tempConnection = await mysql.createConnection(tempConfig);
      
      // 检查数据库是否存在
      const [databases] = await tempConnection.query(
        'SHOW DATABASES LIKE ?', [this.dbConfig.database]
      );
      
      if (databases.length === 0) {
        console.log(`📁 创建数据库: ${this.dbConfig.database}`);
        await tempConnection.query(`CREATE DATABASE ${this.dbConfig.database}`);
        console.log('✅ 数据库创建成功');
      } else {
        console.log(`✅ 数据库 ${this.dbConfig.database} 已存在`);
      }
      
      await tempConnection.end();
      
      // 重新连接到指定数据库
      return await this.connect();
    } catch (error) {
      console.error('❌ 确保数据库存在失败:', error.message);
      return false;
    }
  }

  /**
   * 获取所有表列表
   */
  async getTableList() {
    try {
      const [tables] = await this.connection.query('SHOW TABLES');
      return tables.map(table => Object.values(table)[0]);
    } catch (error) {
      console.error('❌ 获取表列表失败:', error.message);
      return [];
    }
  }

  /**
   * 检查表结构
   */
  async checkTableStructure(tableName) {
    try {
      const [columns] = await this.connection.query(`DESCRIBE ${tableName}`);
      return {
        tableName,
        columnCount: columns.length,
        columns: columns.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          default: col.Default,
          key: col.Key,
        }))
      };
    } catch (error) {
      return { tableName, error: error.message };
    }
  }

  /**
   * 执行SQL文件
   */
  async executeSqlFile(filePath) {
    try {
      const sqlContent = await fs.readFile(filePath, 'utf8');
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log(`📄 执行SQL文件: ${path.basename(filePath)}`);
      
      for (const stmt of statements) {
        if (stmt) {
          await this.connection.query(stmt);
        }
      }
      
      console.log(`✅ SQL文件执行完成: ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      console.error(`❌ 执行SQL文件失败: ${filePath}`, error.message);
      return false;
    }
  }

  /**
   * 智能检测并创建缺失的表
   */
  async autoCreateMissingTables() {
    console.log('🔍 开始智能检测缺失表...');
    
    const requiredTables = [
      // 核心业务表
      'mall_members', 'mall_product', 'mall_order', 'mall_order_item',
      'mall_product_category', 'mall_product_brand', 'mall_product_sku',
      'mall_member_address', 'mall_member_level', 'mall_member_points',
      'mall_member_coupon',
      
      // 营销相关表
      'mall_promotion_coupon', 'mall_promotion_seckill', 'mall_promotion_seckill_goods',
      'mall_promotion_groupbuy', 'mall_promotion_groupbuy_goods',
      
      // 搜索相关表
      'mall_search_history', 'mall_hot_words',
      
      // 分销相关表
      'mall_distribution', 'mall_distribution_record',
      
      // 支付相关表
      'mall_payment', 'mall_wallet', 'mall_wallet_record'
    ];

    const existingTables = await this.getTableList();
    const missingTables = requiredTables.filter(table => 
      !existingTables.includes(table)
    );

    if (missingTables.length === 0) {
      console.log('✅ 所有必需表已存在');
      return true;
    }

    console.log(`📋 发现 ${missingTables.length} 个缺失表:`);
    missingTables.forEach(table => console.log(`  - ${table}`));

    // 执行缺失表创建脚本
    const missingTablesFile = path.join(__dirname, 'create-missing-tables.sql');
    if (await fs.access(missingTablesFile).then(() => true).catch(() => false)) {
      return await this.executeSqlFile(missingTablesFile);
    } else {
      console.log('⚠️ 缺失表创建脚本不存在，跳过表创建');
      return false;
    }
  }

  /**
   * 优化索引和表结构
   */
  async optimizeDatabase() {
    console.log('⚡ 开始数据库优化...');
    
    const optimizeFile = path.join(__dirname, 'optimize-indexes-tables.sql');
    if (await fs.access(optimizeFile).then(() => true).catch(() => false)) {
      return await this.executeSqlFile(optimizeFile);
    } else {
      console.log('⚠️ 数据库优化脚本不存在，跳过优化');
      return false;
    }
  }

  /**
   * 重命名旧表（从li_前缀到mall_前缀）
   */
  async renameLegacyTables() {
    console.log('🔄 开始重命名旧表...');
    
    try {
      const [oldTables] = await this.connection.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name LIKE 'li_%'",
        [this.dbConfig.database]
      );

      if (oldTables.length === 0) {
        console.log('✅ 没有需要重命名的旧表');
        return true;
      }

      console.log(`🔄 发现 ${oldTables.length} 个需要重命名的旧表:`);
      
      for (const table of oldTables) {
        const oldName = table.TABLE_NAME;
        const newName = oldName.replace(/^li_/, 'mall_');
        
        try {
          await this.connection.query(`RENAME TABLE ${oldName} TO ${newName}`);
          console.log(`  ✅ ${oldName} → ${newName}`);
        } catch (error) {
          console.error(`  ❌ 重命名失败: ${oldName}`, error.message);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ 重命名旧表失败:', error.message);
      return false;
    }
  }

  /**
   * 完整的数据库初始化流程
   */
  async initializeDatabase(options = {}) {
    const {
      createMissingTables = true,
      optimizeIndexes = true,
      renameLegacyTables = true,
      verbose = true
    } = options;

    console.log('🚀 开始数据库初始化...');

    // 1. 确保数据库存在
    if (!(await this.ensureDatabase())) {
      return false;
    }

    // 2. 重命名旧表（如果需要）
    if (renameLegacyTables) {
      if (!(await this.renameLegacyTables())) {
        console.log('⚠️ 旧表重命名失败，继续其他操作');
      }
    }

    // 3. 创建缺失表
    if (createMissingTables) {
      if (!(await this.autoCreateMissingTables())) {
        return false;
      }
    }

    // 4. 优化索引和表结构
    if (optimizeIndexes) {
      if (!(await this.optimizeDatabase())) {
        console.log('⚠️ 数据库优化失败，继续其他操作');
      }
    }

    // 5. 显示最终表状态
    const finalTables = await this.getTableList();
    console.log(`\n📊 数据库初始化完成，当前共有 ${finalTables.length} 个表:`);
    finalTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });

    console.log('🎉 数据库初始化完成！');
    return true;
  }

  /**
   * 数据库健康检查
   */
  async healthCheck() {
    console.log('🏥 开始数据库健康检查...');

    try {
      // 1. 检查连接状态
      const [result] = await this.connection.query('SELECT 1 as status');
      if (result.status !== 1) {
        throw new Error('数据库连接异常');
      }

      // 2. 检查表数量
      const tables = await this.getTableList();
      console.log(`📊 表数量: ${tables.length}`);

      // 3. 检查关键表
      const keyTables = ['mall_members', 'mall_product', 'mall_order'];
      const missingKeyTables = keyTables.filter(table => !tables.includes(table));
      
      if (missingKeyTables.length > 0) {
        console.log(`⚠️ 缺失关键表: ${missingKeyTables.join(', ')}`);
        return false;
      }

      // 4. 检查表结构
      console.log('🔍 检查关键表结构...');
      for (const table of keyTables) {
        const structure = await this.checkTableStructure(table);
        if (structure.error) {
          console.log(`❌ 表 ${table} 结构异常: ${structure.error}`);
          return false;
        }
        console.log(`  ✅ ${table}: ${structure.columnCount} 个字段`);
      }

      console.log('✅ 数据库健康检查通过');
      return true;
    } catch (error) {
      console.error('❌ 数据库健康检查失败:', error.message);
      return false;
    }
  }

  /**
   * 创建版本管理表
   */
  async createVersionTable() {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${this.versionTableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version VARCHAR(20) NOT NULL UNIQUE,
          description VARCHAR(500) NOT NULL,
          applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          applied_by VARCHAR(100) DEFAULT 'system',
          status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
          error_message TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      
      await this.connection.query(createTableSQL);
      console.log('✅ 版本管理表创建成功');
      return true;
    } catch (error) {
      console.error('❌ 创建版本管理表失败:', error.message);
      return false;
    }
  }

  /**
   * 获取当前数据库版本
   */
  async getCurrentVersion() {
    try {
      // 检查版本表是否存在
      const [tables] = await this.connection.query(
        'SHOW TABLES LIKE ?', [this.versionTableName]
      );
      
      if (tables.length === 0) {
        return null; // 版本表不存在，说明是全新数据库
      }

      // 获取最新的版本记录
      const [rows] = await this.connection.query(
        `SELECT version FROM ${this.versionTableName} 
         WHERE status = 'success' 
         ORDER BY applied_at DESC LIMIT 1`
      );

      return rows.length > 0 ? rows[0].version : null;
    } catch (error) {
      console.error('❌ 获取当前版本失败:', error.message);
      return null;
    }
  }

  /**
   * 记录版本应用结果
   */
  async logVersion(version, description, status = 'success', errorMessage = null) {
    try {
      await this.connection.query(
        `INSERT INTO ${this.versionTableName} 
         (version, description, status, error_message) 
         VALUES (?, ?, ?, ?)`,
        [version, description, status, errorMessage]
      );
      console.log(`📝 记录版本: ${version} - ${status}`);
    } catch (error) {
      console.error('❌ 记录版本失败:', error.message);
    }
  }

  /**
   * 智能检测需要应用的版本
   */
  async detectRequiredVersions(currentVersion) {
    if (!currentVersion) {
      // 全新数据库，需要应用所有版本
      console.log('🆕 检测到全新数据库，需要应用所有版本');
      return this.versions;
    }

    const currentIndex = this.versions.findIndex(v => v.version === currentVersion);
    if (currentIndex === -1) {
      // 当前版本不在版本列表中，可能是手动修改的版本
      console.log(`⚠️ 当前版本 ${currentVersion} 不在版本列表中，将检查表结构`);
      return await this.detectVersionsByTableStructure();
    }

    // 返回需要应用的新版本
    return this.versions.slice(currentIndex + 1);
  }

  /**
   * 通过表结构检测需要应用的版本
   */
  async detectVersionsByTableStructure() {
    const requiredVersions = [];

    for (const version of this.versions) {
      const missingTables = [];
      
      for (const table of version.requiredTables) {
        if (!(await this.checkTableExists(table))) {
          missingTables.push(table);
        }
      }
      
      if (missingTables.length > 0) {
        console.log(`🔍 版本 ${version.version} 缺失表: ${missingTables.join(', ')}`);
        requiredVersions.push(version);
      } else {
        console.log(`✅ 版本 ${version.version} 的表结构已存在`);
      }
    }

    return requiredVersions;
  }

  /**
   * 检查表是否存在
   */
  async checkTableExists(tableName) {
    try {
      const [tables] = await this.connection.query(
        'SHOW TABLES LIKE ?', [tableName]
      );
      return tables.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 应用单个版本
   */
  async applyVersion(version) {
    console.log(`🚀 开始应用版本 ${version.version}: ${version.description}`);

    try {
      // 检查SQL文件是否存在
      const sqlFilePath = path.join(__dirname, version.sqlFile);
      
      if (!(await fs.access(sqlFilePath).then(() => true).catch(() => false))) {
        console.log(`⚠️ SQL文件不存在: ${version.sqlFile}，跳过此版本`);
        await this.logVersion(version.version, version.description, 'failed', 'SQL文件不存在');
        return false;
      }

      // 执行SQL文件
      const success = await this.executeSqlFile(sqlFilePath);
      
      if (success) {
        await this.logVersion(version.version, version.description, 'success');
        console.log(`✅ 版本 ${version.version} 应用成功`);
        return true;
      } else {
        await this.logVersion(version.version, version.description, 'failed', 'SQL执行失败');
        console.log(`❌ 版本 ${version.version} 应用失败`);
        return false;
      }
    } catch (error) {
      await this.logVersion(version.version, version.description, 'failed', error.message);
      console.error(`❌ 应用版本 ${version.version} 时发生错误:`, error.message);
      return false;
    }
  }

  /**
   * 数据库版本更新流程
   */
  async updateDatabaseVersions() {
    console.log('🔍 开始数据库版本检测和更新...');

    try {
      // 创建版本管理表
      if (!(await this.createVersionTable())) {
        return false;
      }

      // 获取当前版本
      const currentVersion = await this.getCurrentVersion();
      console.log(`📊 当前数据库版本: ${currentVersion || '全新数据库'}`);

      // 检测需要应用的版本
      const requiredVersions = await this.detectRequiredVersions(currentVersion);

      if (requiredVersions.length === 0) {
        console.log('✅ 数据库已是最新版本，无需更新');
        return true;
      }

      console.log(`📋 发现 ${requiredVersions.length} 个需要应用的版本:`);
      requiredVersions.forEach(v => console.log(`  - ${v.version}: ${v.description}`));

      // 按顺序应用版本
      let successCount = 0;
      for (const version of requiredVersions) {
        const success = await this.applyVersion(version);
        if (success) {
          successCount++;
        } else {
          console.log(`⚠️ 版本 ${version.version} 应用失败，停止后续版本应用`);
          break;
        }
      }

      console.log(`\n📊 版本更新结果:`);
      console.log(`  ✅ 成功应用: ${successCount} 个版本`);
      console.log(`  ❌ 失败应用: ${requiredVersions.length - successCount} 个版本`);

      return successCount === requiredVersions.length;
    } catch (error) {
      console.error('❌ 版本更新失败:', error.message);
      return false;
    }
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory() {
    try {
      const [rows] = await this.connection.query(
        `SELECT version, description, applied_at, status, error_message 
         FROM ${this.versionTableName} 
         ORDER BY applied_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('❌ 获取版本历史失败:', error.message);
      return [];
    }
  }

  /**
   * 增强的健康检查（包含版本检查）
   */
  async enhancedHealthCheck() {
    console.log('🏥 开始增强数据库健康检查（包含版本检查）...');

    try {
      const health = {
        healthy: true,
        details: {}
      };

      // 1. 检查连接
      const [connResult] = await this.connection.query('SELECT 1 as status');
      health.details.connection = connResult.status === 1 ? '正常' : '异常';

      // 2. 检查版本表
      const versionTableExists = await this.checkTableExists(this.versionTableName);
      health.details.versionTable = versionTableExists ? '存在' : '缺失';

      // 3. 获取当前版本
      const currentVersion = await this.getCurrentVersion();
      health.details.currentVersion = currentVersion || '未知';

      // 4. 检查关键表
      const keyTables = ['mall_members', 'mall_product', 'mall_order'];
      health.details.missingTables = [];

      for (const table of keyTables) {
        if (!(await this.checkTableExists(table))) {
          health.details.missingTables.push(table);
        }
      }

      // 5. 综合健康状态
      if (health.details.missingTables.length > 0) {
        health.healthy = false;
        health.error = `缺失关键表: ${health.details.missingTables.join(', ')}`;
      }

      if (!versionTableExists) {
        health.warning = '版本管理表不存在，建议运行数据库更新';
      }

      console.log('📊 健康检查结果:');
      console.log(`  连接状态: ${health.details.connection}`);
      console.log(`  版本表: ${health.details.versionTable}`);
      console.log(`  当前版本: ${health.details.currentVersion}`);
      console.log(`  缺失表: ${health.details.missingTables.length > 0 ? health.details.missingTables.join(', ') : '无'}`);
      console.log(`  整体状态: ${health.healthy ? '✅ 健康' : '❌ 异常'}`);

      return health;
    } catch (error) {
      console.error('❌ 增强健康检查失败:', error.message);
      return { healthy: false, error: error.message };
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  const dbManager = new DatabaseManager();

  try {
    switch (command) {
      case 'init':
        // 新项目初始化
        if (await dbManager.connect()) {
          await dbManager.initializeDatabase({
            createMissingTables: true,
            optimizeIndexes: true,
            renameLegacyTables: true
          });
        }
        break;

      case 'check':
        // 基础健康检查
        if (await dbManager.connect()) {
          await dbManager.healthCheck();
        }
        break;

      case 'health':
        // 增强健康检查（包含版本）
        if (await dbManager.connect()) {
          await dbManager.enhancedHealthCheck();
        }
        break;

      case 'update':
        // 旧项目更新
        if (await dbManager.connect()) {
          await dbManager.initializeDatabase({
            createMissingTables: true,
            optimizeIndexes: false,
            renameLegacyTables: false
          });
        }
        break;

      case 'version':
        // 版本更新
        if (await dbManager.connect()) {
          await dbManager.updateDatabaseVersions();
        }
        break;

      case 'tables':
        // 显示表列表
        if (await dbManager.connect()) {
          const tables = await dbManager.getTableList();
          console.log('\n📋 数据库表列表:');
          tables.forEach((table, index) => {
            console.log(`  ${index + 1}. ${table}`);
          });
        }
        break;

      case 'history':
        // 查看版本历史
        if (await dbManager.connect()) {
          const history = await dbManager.getVersionHistory();
          console.log('\n📜 数据库版本历史:');
          history.forEach(record => {
            console.log(`  ${record.applied_at} - ${record.version} - ${record.description} - ${record.status}`);
          });
        }
        break;

      case 'current':
        // 查看当前版本
        if (await dbManager.connect()) {
          const currentVersion = await dbManager.getCurrentVersion();
          console.log(`📊 当前数据库版本: ${currentVersion || '全新数据库'}`);
        }
        break;

      case 'optimize':
        // 优化数据库
        if (await dbManager.connect()) {
          await dbManager.optimizeDatabase();
        }
        break;

      default:
        console.log(`
📖 统一数据库管理器使用方法:
  node database-manager.js [command]

核心管理命令:
  init    - 新项目初始化（创建数据库和所有表）
  update  - 旧项目更新（只创建缺失表）
  health  - 增强健康检查（包含版本检查）
  version - 更新数据库到最新版本

辅助命令:
  check   - 基础健康检查
  tables  - 显示所有表列表
  history - 查看版本历史记录
  current - 查看当前数据库版本
  optimize - 优化索引和表结构

示例:
  node database-manager.js init    # 新项目部署
  node database-manager.js health  # 日常健康检查
  node database-manager.js version # 版本更新
        `);
        break;
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await dbManager.disconnect();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;