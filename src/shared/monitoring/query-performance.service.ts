import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * 查询性能服务
 * 提供查询性能分析和优化建议
 */
@Injectable()
export class QueryPerformanceService {
  private readonly logger = new Logger(QueryPerformanceService.name);
  private readonly queryMetrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 记录查询性能
   */
  recordQuery(query: string, executionTime: number): void {
    const normalizedQuery = this.normalizeQuery(query);
    if (!this.queryMetrics.has(normalizedQuery)) {
      this.queryMetrics.set(normalizedQuery, { count: 0, totalTime: 0, avgTime: 0 });
    }

    const metrics = this.queryMetrics.get(normalizedQuery)!;
    metrics.count++;
    metrics.totalTime += executionTime;
    metrics.avgTime = metrics.totalTime / metrics.count;

    // 如果查询时间超过阈值，记录警告
    if (executionTime > 1000) {
      this.logger.warn(`Slow query detected: ${executionTime}ms - ${normalizedQuery.substring(0, 100)}`);
    }
  }

  /**
   * 规范化查询（移除参数值，便于统计）
   */
  private normalizeQuery(query: string): string {
    // 移除数字参数
    let normalized = query.replace(/\d+/g, '?');
    // 移除字符串参数
    normalized = normalized.replace(/'[^']*'/g, '?');
    // 移除多余空格
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }

  /**
   * 获取慢查询列表
   */
  getSlowQueries(threshold: number = 1000): Array<{ query: string; avgTime: number; count: number }> {
    const slowQueries: Array<{ query: string; avgTime: number; count: number }> = [];

    this.queryMetrics.forEach((metrics, query) => {
      if (metrics.avgTime > threshold) {
        slowQueries.push({
          query,
          avgTime: metrics.avgTime,
          count: metrics.count,
        });
      }
    });

    return slowQueries.sort((a, b) => b.avgTime - a.avgTime);
  }

  /**
   * 获取查询统计报告
   */
  getQueryReport(): {
    totalQueries: number;
    slowQueries: number;
    avgExecutionTime: number;
    topSlowQueries: Array<{ query: string; avgTime: number; count: number }>;
  } {
    let totalQueries = 0;
    let totalTime = 0;
    let slowQueries = 0;

    this.queryMetrics.forEach((metrics) => {
      totalQueries += metrics.count;
      totalTime += metrics.totalTime;
      if (metrics.avgTime > 1000) {
        slowQueries++;
      }
    });

    const avgExecutionTime = totalQueries > 0 ? totalTime / totalQueries : 0;
    const topSlowQueries = this.getSlowQueries(1000).slice(0, 10);

    return {
      totalQueries,
      slowQueries,
      avgExecutionTime,
      topSlowQueries,
    };
  }

  /**
   * 分析N+1查询问题
   */
  async analyzeNPlusOneQueries(): Promise<Array<{ pattern: string; count: number; suggestion: string }>> {
    const nPlusOnePatterns: Array<{ pattern: string; count: number; suggestion: string }> = [];

    // 检测可能的N+1查询模式
    // 例如：同一个查询被多次执行
    const queryCounts = new Map<string, number>();
    this.queryMetrics.forEach((metrics, query) => {
      if (metrics.count > 10) {
        // 如果同一个查询执行超过10次，可能是N+1问题
        queryCounts.set(query, metrics.count);
      }
    });

    queryCounts.forEach((count, query) => {
      if (count > 50) {
        nPlusOnePatterns.push({
          pattern: query.substring(0, 100),
          count,
          suggestion: '考虑使用批量查询或JOIN优化',
        });
      }
    });

    return nPlusOnePatterns;
  }

  /**
   * 重置统计
   */
  resetMetrics(): void {
    this.queryMetrics.clear();
    this.logger.log('Query performance metrics reset');
  }
}

