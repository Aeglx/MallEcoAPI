const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

async function createSearchTables() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'malleco',
    });

    console.log('数据库连接成功');

    // 创建热门关键词表
    const createHotWordsTable = `
      CREATE TABLE IF NOT EXISTS mall_hot_words (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        keyword VARCHAR(100) NOT NULL COMMENT '关键词',
        score INT DEFAULT 1 COMMENT '热度分数',
        enabled TINYINT DEFAULT 1 COMMENT '是否启用 1:是 0:否',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_keyword (keyword),
        INDEX idx_score (score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热门搜索关键词表';
    `;
    
    await connection.query(createHotWordsTable);
    console.log('mall_hot_words 表创建成功');

    // 创建搜索历史表
    const createSearchHistoryTable = `
      CREATE TABLE IF NOT EXISTS mall_search_history (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(32) COMMENT '用户ID',
        keyword VARCHAR(100) NOT NULL COMMENT '搜索关键词',
        user_ip VARCHAR(50) COMMENT '用户IP',
        user_agent TEXT COMMENT '用户浏览器',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_user_id (user_id),
        INDEX idx_keyword (keyword),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索历史表';
    `;
    
    await connection.query(createSearchHistoryTable);
    console.log('mall_search_history 表创建成功');

    // 关闭连接
    await connection.end();
    console.log('\n数据库连接已关闭');
    console.log('所有搜索相关表创建完成');
  } catch (error) {
    console.error('创建表失败:', error);
  }
}

createSearchTables();
