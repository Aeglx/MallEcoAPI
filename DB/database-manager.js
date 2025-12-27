const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 读取配置文件
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../config/.env') });

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'malleco',
  charset: process.env.DB_CHARSET || 'utf8mb4'
};

/**
 * 数据库管理器类
 */
class DatabaseManager {
  constructor() {
    this.config = config;
  }

  /**
   * 初始化数据库
   */
  async initialize() {
    console.log('🔍 开始初始化数据库...');
    
    try {
      // 1. 连接到MySQL服务器（不指定数据库）
      const connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        charset: this.config.charset
      });
      
      console.log('✅ 成功连接到MySQL服务器');
      
      // 2. 创建数据库（如果不存在）
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` DEFAULT CHARACTER SET ${this.config.charset}`);
      console.log(`✅ 成功创建数据库: ${this.config.database}`);
      
      // 3. 关闭当前连接并重新连接到指定的数据库
      await connection.end();
      
      // 4. 重新连接到指定的数据库
      const dbConnection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset,
        multipleStatements: true // 支持多语句执行
      });
      
      // 5. 读取并执行SQL初始化脚本
      const sqlPath = path.join(__dirname, 'database-initialization.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // 6. 执行SQL脚本
      await dbConnection.query(sqlContent);
      
      // 7. 关闭连接
      await dbConnection.end();
      
      console.log('✅ 所有SQL语句执行完成');
      console.log('🎉 数据库初始化完成！');
      console.log('');
      console.log('📋 初始账号信息：');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 管理员账号：');
      console.log('   用户名：admin');
      console.log('   密码：dav888');
      console.log('   邮箱：admin@malleco.com');
      console.log('   角色：超级管理员');
      console.log('');
      console.log('👤 运营账号：');
      console.log('   用户名：operator');
      console.log('   密码：dav888');
      console.log('   邮箱：operator@malleco.com');
      console.log('   角色：运营管理员');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  请登录后立即修改默认密码！');
      
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 分割SQL语句
   * @param {string} sqlContent SQL脚本内容
   * @returns {string[]} 分割后的SQL语句数组
   */
  splitSqlStatements(sqlContent) {
    // 使用分号分割SQL语句，但要忽略字符串和注释中的分号
    const statements = [];
    let statement = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inComment = false;
    let inMultiLineComment = false;
    
    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const nextChar = sqlContent[i + 1];
      
      // 处理注释
      if (!inSingleQuote && !inDoubleQuote) {
        // 单行注释
        if (char === '-' && nextChar === '-') {
          inComment = true;
          statement += char;
          continue;
        }
        
        // 多行注释开始
        if (char === '/' && nextChar === '*') {
          inMultiLineComment = true;
          statement += char;
          continue;
        }
        
        // 多行注释结束
        if (char === '*' && nextChar === '/') {
          inMultiLineComment = false;
          statement += char + nextChar;
          i++;
          continue;
        }
      }
      
      // 处理字符串
      if (!inComment && !inMultiLineComment) {
        if (char === "'" && !inDoubleQuote) {
          inSingleQuote = !inSingleQuote;
        } else if (char === '"' && !inSingleQuote) {
          inDoubleQuote = !inDoubleQuote;
        }
      }
      
      // 处理分号（语句结束符）
      if (char === ';' && !inSingleQuote && !inDoubleQuote && !inComment && !inMultiLineComment) {
        statements.push(statement.trim());
        statement = '';
      } else {
        statement += char;
      }
      
      // 单行注释结束
      if (inComment && char === '\n') {
        inComment = false;
      }
    }
    
    // 添加最后一个语句（如果有）
    if (statement.trim()) {
      statements.push(statement.trim());
    }
    
    return statements;
  }

  /**
   * 检查数据库连接
   */
  async checkConnection() {
    try {
      const connection = await mysql.createConnection(this.config);
      await connection.end();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取数据库信息
   */
  async getDatabaseInfo() {
    try {
      const connection = await mysql.createConnection(this.config);
      const [rows] = await connection.execute('SELECT DATABASE() as db_name, VERSION() as mysql_version');
      await connection.end();
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

// 导出数据库管理器
module.exports = DatabaseManager;

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  const manager = new DatabaseManager();
  manager.initialize().catch(error => {
    console.error('初始化失败:', error);
    process.exit(1);
  });
}