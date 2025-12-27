import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

interface PerformanceMetrics {
  connectionCount: number;
  activeConnections: number;
  slowQueries: SlowQueryMetric[];
  tableStatistics: TableStats[];
  indexUsage: IndexUsage[];
  memoryUsage: MemoryMetric;
}

interface SlowQueryMetric {
  query: string;
  executionTime: number;
  frequency: number;
  timestamp: Date;
  suggestedAction: string;
}

interface TableStats {
  tableName: string;
  rowCount: number;
  dataSize: string;
  indexSize: string;
  avgRowLength: number;
  lastUpdate: Date;
}

interface IndexUsage {
  tableName: string;
  indexName: string;
  usageCount: number;
  cardinality: number;
  efficiency: number;
}

interface MemoryMetric {
  innodbBufferPool: number;
  keyBufferSize: number;
  queryCacheSize: number;
  sortBufferSize: number;
}

@Injectable()
export class DatabasePerformanceMonitor {
  private readonly logger = new Logger(DatabasePerformanceMonitor.name);
  private performanceHistory: PerformanceMetrics[] = [];

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 每分钟收集性能指标
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics = await this.gatherMetrics();
    this.performanceHistory.push(metrics);

    // 保留最近1小时的历史数据
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift();
    }

    // 检查性能问题并发出警告
    this.checkPerformanceIssues(metrics);

    return metrics;
  }

  /**
   * 获取实时性能指标
   */
  async getRealTimeMetrics(): Promise<PerformanceMetrics> {
    return await this.gatherMetrics();
  }

  /**
   * 获取性能趋势
   */
  getPerformanceTrends(minutes: number = 30): any {
    const recentHistory = this.performanceHistory.slice(-minutes);

    return {
      avgConnections: this.calculateAverage(recentHistory, 'connectionCount'),
      avgSlowQueries: this.calculateAverage(recentHistory, 'slowQueries'),
      peakMemoryUsage: this.calculatePeak(recentHistory, 'memoryUsage'),
      performanceScore: this.calculatePerformanceScore(recentHistory),
    };
  }

  /**
   * 收集所有性能指标
   */
  private async gatherMetrics(): Promise<PerformanceMetrics> {
    const [
      connectionCount,
      activeConnections,
      slowQueries,
      tableStatistics,
      indexUsage,
      memoryUsage,
    ] = await Promise.all([
      this.getConnectionCount(),
      this.getActiveConnections(),
      this.getSlowQueries(),
      this.getTableStatistics(),
      this.getIndexUsage(),
      this.getMemoryUsage(),
    ]);

    return {
      connectionCount,
      activeConnections,
      slowQueries,
      tableStatistics,
      indexUsage,
      memoryUsage,
    };
  }

  /**
   * 获取连接数统计
   */
  private async getConnectionCount(): Promise<number> {
    try {
      const result = await this.dataSource.query('SHOW STATUS LIKE "Threads_connected"');
      return parseInt(result[0].Value) || 0;
    } catch (error) {
      this.logger.warn('获取连接数失败', error);
      return 0;
    }
  }

  /**
   * 获取活跃连接数
   */
  private async getActiveConnections(): Promise<number> {
    try {
      const result = await this.dataSource.query('SHOW STATUS LIKE "Threads_running"');
      return parseInt(result[0].Value) || 0;
    } catch (error) {
      this.logger.warn('获取活跃连接数失败', error);
      return 0;
    }
  }

  /**
   * 获取慢查询统计
   */
  private async getSlowQueries(): Promise<SlowQueryMetric[]> {
    try {
      // 获取慢查询日志中的查询
      const result = await this.dataSource.query(`
        SELECT 
          sql_text,
          exec_time,
          timer_wait/1000000000 as execution_time,
          digest_text
        FROM performance_schema.events_statements_history_long 
        WHERE timer_wait > 1000000000 
        ORDER BY timer_wait DESC 
        LIMIT 10
      `);

      return result.map((row: any) => ({
        query: row.sql_text,
        executionTime: row.execution_time,
        frequency: 1,
        timestamp: new Date(),
        suggestedAction: this.generateSuggestedAction(row.sql_text, row.execution_time),
      }));
    } catch (error) {
      this.logger.warn('获取慢查询失败', error);
      return [];
    }
  }

  /**
   * 获取表统计信息
   */
  private async getTableStatistics(): Promise<TableStats[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          table_name,
          table_rows,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) as data_size,
          ROUND((index_length / 1024 / 1024), 2) as index_size,
          ROUND((avg_row_length), 2) as avg_row_length,
          update_time
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY data_length DESC
        LIMIT 20
      `);

      return result.map((row: any) => ({
        tableName: row.table_name,
        rowCount: row.table_rows || 0,
        dataSize: `${row.data_size}MB`,
        indexSize: `${row.index_size}MB`,
        avgRowLength: row.avg_row_length || 0,
        lastUpdate: row.update_time || new Date(),
      }));
    } catch (error) {
      this.logger.warn('获取表统计信息失败', error);
      return [];
    }
  }

  /**
   * 获取索引使用情况
   */
  private async getIndexUsage(): Promise<IndexUsage[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          table_name,
          index_name,
          rows_read,
          rows_inserted,
          rows_updated,
          rows_deleted
        FROM performance_schema.table_io_waits_summary_by_index_usage 
        WHERE index_name IS NOT NULL
        ORDER BY rows_read DESC
        LIMIT 15
      `);

      return result.map((row: any) => {
        const totalOperations =
          row.rows_read + row.rows_inserted + row.rows_updated + row.rows_deleted;
        const efficiency = totalOperations > 0 ? (row.rows_read / totalOperations) * 100 : 0;

        return {
          tableName: row.table_name,
          indexName: row.index_name,
          usageCount: row.rows_read,
          cardinality: 0, // 简化处理
          efficiency: Math.round(efficiency),
        };
      });
    } catch (error) {
      this.logger.warn('获取索引使用情况失败', error);
      return [];
    }
  }

  /**
   * 获取内存使用情况
   */
  private async getMemoryUsage(): Promise<MemoryMetric> {
    try {
      const [innodbBufferPool, keyBufferSize, queryCacheSize, sortBufferSize] = await Promise.all([
        this.getVariableValue('innodb_buffer_pool_size'),
        this.getVariableValue('key_buffer_size'),
        this.getVariableValue('query_cache_size'),
        this.getVariableValue('sort_buffer_size'),
      ]);

      return {
        innodbBufferPool: innodbBufferPool,
        keyBufferSize,
        queryCacheSize,
        sortBufferSize,
      };
    } catch (error) {
      this.logger.warn('获取内存使用情况失败', error);
      return {
        innodbBufferPool: 0,
        keyBufferSize: 0,
        queryCacheSize: 0,
        sortBufferSize: 0,
      };
    }
  }

  /**
   * 获取MySQL变量值
   */
  private async getVariableValue(variableName: string): Promise<number> {
    const result = await this.dataSource.query(`SHOW VARIABLES LIKE '${variableName}'`);
    return parseInt(result[0]?.Value) || 0;
  }

  /**
   * 检查性能问题
   */
  private checkPerformanceIssues(metrics: PerformanceMetrics): void {
    // 检查连接数
    if (metrics.connectionCount > 80) {
      this.logger.warn(`数据库连接数过高: ${metrics.connectionCount}`);
    }

    // 检查慢查询
    if (metrics.slowQueries.length > 5) {
      this.logger.warn(`慢查询数量过多: ${metrics.slowQueries.length}`);
      this.logSlowQueries(metrics.slowQueries);
    }

    // 检查索引效率
    const inefficientIndexes = metrics.indexUsage.filter(index => index.efficiency < 50);
    if (inefficientIndexes.length > 0) {
      this.logger.warn(`发现 ${inefficientIndexes.length} 个低效索引`);
    }
  }

  /**
   * 生成优化建议
   */
  private generateSuggestedAction(query: string, executionTime: number): string {
    if (executionTime > 5) {
      return '查询执行时间过长，建议优化或添加索引';
    } else if (query.toLowerCase().includes('select *')) {
      return '避免使用 SELECT *，只查询需要的字段';
    } else if (query.toLowerCase().includes('order by') && !query.toLowerCase().includes('limit')) {
      return 'ORDER BY 后建议使用 LIMIT 限制结果集';
    } else {
      return '考虑添加适当的索引优化查询性能';
    }
  }

  /**
   * 记录慢查询
   */
  private logSlowQueries(slowQueries: SlowQueryMetric[]): void {
    for (const slowQuery of slowQueries.slice(0, 3)) {
      this.logger.warn(
        `慢查询 [${slowQuery.executionTime}s]: ${slowQuery.query.substring(0, 200)}...`,
      );
    }
  }

  /**
   * 计算平均值
   */
  private calculateAverage(
    history: PerformanceMetrics[],
    property: keyof PerformanceMetrics,
  ): number {
    if (history.length === 0) return 0;

    const values = history.map(h => h[property] as number).filter(v => typeof v === 'number');
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * 计算峰值
   */
  private calculatePeak(history: PerformanceMetrics[], property: keyof PerformanceMetrics): number {
    if (history.length === 0) return 0;

    const values = history.map(h => h[property] as number).filter(v => typeof v === 'number');
    return Math.max(...values);
  }

  /**
   * 计算性能评分
   */
  private calculatePerformanceScore(history: PerformanceMetrics[]): number {
    if (history.length === 0) return 100;

    const avgSlowQueries = this.calculateAverage(history, 'slowQueries');
    const avgConnections = this.calculateAverage(history, 'connectionCount');

    // 简单的评分算法
    let score = 100;

    // 慢查询影响 (最多扣40分)
    score -= Math.min(avgSlowQueries * 10, 40);

    // 连接数影响 (最多扣30分)
    score -= Math.min((avgConnections / 100) * 30, 30);

    return Math.max(score, 0);
  }
}
