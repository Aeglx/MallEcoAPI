import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * 数据库性能优化服务
 */
@Injectable()
export class DatabaseOptimizerService implements OnModuleInit {
  private dataSource: DataSource;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeQueryOptimizations();
  }

  /**
   * 初始化查询优化
   */
  private async initializeQueryOptimizations() {
    // 设置数据库会话级别的优化参数
    await this.optimizeSessionSettings();
    
    // 创建必要的索引（如果不存在）
    await this.createRecommendedIndexes();
  }

  /**
   * 优化数据库会话设置
   */
  private async optimizeSessionSettings() {
    const optimizationQueries = [
      // 设置查询缓存大小
      "SET SESSION query_cache_type = 1",
      "SET SESSION query_cache_size = 67108864", // 64MB
      
      // 优化排序和分组操作
      "SET SESSION sort_buffer_size = 262144",
      "SET SESSION read_buffer_size = 131072",
      "SET SESSION read_rnd_buffer_size = 262144",
      
      // 优化连接设置
      "SET SESSION net_read_timeout = 30",
      "SET SESSION net_write_timeout = 60",
      
      // 优化临时表
      "SET SESSION tmp_table_size = 67108864",
      "SET SESSION max_heap_table_size = 67108864"
    ];

    try {
      for (const query of optimizationQueries) {
        await this.dataSource.query(query);
      }
      console.log('Database session optimization completed');
    } catch (error) {
      console.warn('Database session optimization failed:', error.message);
    }
  }

  /**
   * 创建推荐索引
   */
  private async createRecommendedIndexes() {
    const indexQueries = [
      // 为常用查询字段创建索引
      `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_products_is_show ON products(is_show)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_member_id ON orders(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile)`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_distribution_member_id ON distribution(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_distribution_status ON distribution(distribution_status)`
    ];

    try {
      for (const query of indexQueries) {
        await this.dataSource.query(query);
      }
      console.log('Database indexes optimization completed');
    } catch (error) {
      console.warn('Database indexes optimization failed:', error.message);
    }
  }

  /**
   * 获取数据库性能统计
   */
  async getPerformanceStats() {
    const statsQueries = {
      tableStats: `
        SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          ROUND((data_length + index_length) / 1024 / 1024, 2) as total_size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY total_size_mb DESC
      `,
      indexStats: `
        SELECT 
          table_name,
          index_name,
          non_unique,
          seq_in_index,
          column_name
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE()
        ORDER BY table_name, index_name, seq_in_index
      `,
      slowQueries: `
        SELECT 
          db,
          query,
          count_star,
          avg_timer_wait / 1000000000 as avg_time_seconds
        FROM performance_schema.events_statements_summary_by_digest 
        WHERE avg_timer_wait > 1000000000
        ORDER BY avg_timer_wait DESC
        LIMIT 10
      `
    };

    try {
      const [tableStats, indexStats, slowQueries] = await Promise.all([
        this.dataSource.query(statsQueries.tableStats),
        this.dataSource.query(statsQueries.indexStats),
        this.dataSource.query(statsQueries.slowQueries)
      ]);

      return {
        tableStats,
        indexStats,
        slowQueries
      };
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      return null;
    }
  }

  /**
   * 分析查询性能
   */
  async analyzeQueryPerformance(query: string, params: any[] = []) {
    try {
      // 使用EXPLAIN分析查询
      const explainResult = await this.dataSource.query(`EXPLAIN ${query}`, params);
      
      // 获取查询执行时间
      const startTime = Date.now();
      await this.dataSource.query(query, params);
      const executionTime = Date.now() - startTime;

      return {
        explain: explainResult,
        executionTime,
        isSlow: executionTime > 1000, // 超过1秒视为慢查询
        recommendations: this.generateOptimizationRecommendations(explainResult)
      };
    } catch (error) {
      throw new Error(`Query analysis failed: ${error.message}`);
    }
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationRecommendations(explainResult: any[]) {
    const recommendations: string[] = [];

    explainResult.forEach((row) => {
      const { type, key, rows, Extra } = row;

      if (type === 'ALL') {
        recommendations.push('建议为查询条件字段添加索引');
      }

      if (rows > 10000) {
        recommendations.push('查询涉及大量数据，考虑添加索引或优化查询条件');
      }

      if (Extra && Extra.includes('Using filesort')) {
        recommendations.push('存在文件排序，考虑为ORDER BY字段添加索引');
      }

      if (Extra && Extra.includes('Using temporary')) {
        recommendations.push('使用了临时表，考虑优化查询结构');
      }
    });

    return recommendations.length > 0 ? recommendations : ['查询性能良好，无需优化'];
  }

  /**
   * 清理无用数据
   */
  async cleanupDatabase() {
    const cleanupQueries = [
      // 清理过期的会话数据
      "DELETE FROM sessions WHERE expires < NOW()",
      
      // 清理过期的验证码
      "DELETE FROM verification_codes WHERE expires_at < NOW()",
      
      // 清理软删除的数据（保留30天）
      "DELETE FROM products WHERE delete_flag = 1 AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)",
      "DELETE FROM orders WHERE delete_flag = 1 AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)",
      "DELETE FROM users WHERE delete_flag = 1 AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
    ];

    try {
      let totalCleaned = 0;
      
      for (const query of cleanupQueries) {
        const result = await this.dataSource.query(query);
        totalCleaned += result.affectedRows || 0;
      }

      console.log(`Database cleanup completed, cleaned ${totalCleaned} records`);
      return { cleanedRecords: totalCleaned };
    } catch (error) {
      console.error('Database cleanup failed:', error);
      throw error;
    }
  }

  /**
   * 设置数据源
   */
  setDataSource(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}