import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * 数据库查询优化服务
 * 提供慢查询分析、索引建议等功能
 */
@Injectable()
export class DatabaseQueryOptimizerService {
  private readonly logger = new Logger(DatabaseQueryOptimizerService.name);
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1秒

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 启用慢查询日志
   */
  async enableSlowQueryLog(): Promise<void> {
    try {
      await this.dataSource.query('SET GLOBAL slow_query_log = 1');
      await this.dataSource.query(
        `SET GLOBAL long_query_time = ${this.SLOW_QUERY_THRESHOLD / 1000}`,
      );
      this.logger.log('Slow query log enabled');
    } catch (error) {
      this.logger.error('Failed to enable slow query log:', error);
    }
  }

  /**
   * 获取慢查询统计
   */
  async getSlowQueryStats(): Promise<any[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          sql_text,
          exec_count,
          avg_timer_wait / 1000000000000 as avg_time_sec,
          sum_timer_wait / 1000000000000 as total_time_sec,
          max_timer_wait / 1000000000000 as max_time_sec
        FROM performance_schema.events_statements_summary_by_digest
        WHERE avg_timer_wait > ${this.SLOW_QUERY_THRESHOLD * 1000000000}
        ORDER BY avg_timer_wait DESC
        LIMIT 20
      `);
      return result;
    } catch (error) {
      this.logger.error('Failed to get slow query stats:', error);
      return [];
    }
  }

  /**
   * 分析查询执行计划
   */
  async analyzeQueryPlan(query: string): Promise<any> {
    try {
      const explainQuery = `EXPLAIN ${query}`;
      const result = await this.dataSource.query(explainQuery);
      return result;
    } catch (error) {
      this.logger.error('Failed to analyze query plan:', error);
      throw error;
    }
  }

  /**
   * 获取表索引信息
   */
  async getTableIndexes(tableName: string): Promise<any[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          INDEX_NAME,
          COLUMN_NAME,
          SEQ_IN_INDEX,
          NON_UNIQUE,
          INDEX_TYPE
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `, [tableName]);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get indexes for table ${tableName}:`, error);
      return [];
    }
  }

  /**
   * 检查未使用的索引
   */
  async getUnusedIndexes(): Promise<any[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          OBJECT_SCHEMA,
          OBJECT_NAME,
          INDEX_NAME
        FROM performance_schema.table_io_waits_summary_by_index_usage
        WHERE INDEX_NAME IS NOT NULL
          AND COUNT_STAR = 0
          AND OBJECT_SCHEMA = DATABASE()
        ORDER BY OBJECT_NAME, INDEX_NAME
      `);
      return result;
    } catch (error) {
      this.logger.warn('Failed to get unused indexes (may not be available):', error);
      return [];
    }
  }

  /**
   * 获取表统计信息
   */
  async getTableStats(tableName: string): Promise<any> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          TABLE_ROWS,
          DATA_LENGTH,
          INDEX_LENGTH,
          DATA_FREE,
          AUTO_INCREMENT
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `, [tableName]);
      return result[0] || null;
    } catch (error) {
      this.logger.error(`Failed to get stats for table ${tableName}:`, error);
      return null;
    }
  }

  /**
   * 优化建议
   */
  async getOptimizationSuggestions(tableName: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    try {
      // 检查表统计信息
      const stats = await this.getTableStats(tableName);
      if (stats) {
        if (stats.DATA_FREE > stats.DATA_LENGTH * 0.1) {
          suggestions.push(`表 ${tableName} 有较多碎片，建议执行 OPTIMIZE TABLE`);
        }
      }

      // 检查索引
      const indexes = await this.getTableIndexes(tableName);
      if (indexes.length === 0) {
        suggestions.push(`表 ${tableName} 没有索引，建议添加主键或常用查询字段的索引`);
      }

      // 检查未使用的索引
      const unusedIndexes = await this.getUnusedIndexes();
      const unusedForTable = unusedIndexes.filter(idx => idx.OBJECT_NAME === tableName);
      if (unusedForTable.length > 0) {
        suggestions.push(
          `表 ${tableName} 有未使用的索引: ${unusedForTable.map(idx => idx.INDEX_NAME).join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to get optimization suggestions for ${tableName}:`, error);
    }

    return suggestions;
  }
}

