import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PerformanceMonitorService {
  private performanceMetrics: Map<string, any[]> = new Map();
  private readonly maxMetricsCount = 1000;

  constructor(private configService: ConfigService) {}

  /**
   * 记录API响应时间
   */
  recordApiResponse(endpoint: string, responseTime: number, statusCode: number) {
    const metric = {
      timestamp: new Date(),
      responseTime,
      statusCode,
      endpoint,
    };

    const key = `api:${endpoint}`;
    this.addMetric(key, metric);
  }

  /**
   * 记录数据库查询性能
   */
  recordDatabaseQuery(query: string, executionTime: number, rowsAffected?: number) {
    const metric = {
      timestamp: new Date(),
      query: query.substring(0, 200), // 截断长查询
      executionTime,
      rowsAffected,
    };

    this.addMetric('database:queries', metric);
  }

  /**
   * 记录缓存操作性能
   */
  recordCacheOperation(
    operation: string,
    cacheType: string,
    hitRate: number,
    responseTime: number,
  ) {
    const metric = {
      timestamp: new Date(),
      operation,
      cacheType,
      hitRate,
      responseTime,
    };

    const key = `cache:${cacheType}`;
    this.addMetric(key, metric);
  }

  /**
   * 记录系统资源使用情况
   */
  recordSystemResources() {
    const metric = {
      timestamp: new Date(),
      cpu: this.getCpuUsage(),
      memory: this.getMemoryUsage(),
      disk: this.getDiskUsage(),
    };

    this.addMetric('system:resources', metric);
  }

  /**
   * 获取API性能统计
   */
  getApiPerformanceStats(endpoint?: string, timeRange?: string) {
    const prefix = endpoint ? `api:${endpoint}` : 'api:';
    const metrics = this.getMetricsByPrefix(prefix);

    if (metrics.length === 0) {
      return null;
    }

    const filteredMetrics = this.filterByTimeRange(metrics, timeRange);

    return {
      totalRequests: filteredMetrics.length,
      averageResponseTime: this.calculateAverage(filteredMetrics, 'responseTime'),
      maxResponseTime: this.calculateMax(filteredMetrics, 'responseTime'),
      minResponseTime: this.calculateMin(filteredMetrics, 'responseTime'),
      successRate: this.calculateSuccessRate(filteredMetrics),
      requestsPerMinute: this.calculateRequestsPerMinute(filteredMetrics),
    };
  }

  /**
   * 获取数据库性能统计
   */
  getDatabasePerformanceStats(timeRange?: string) {
    const metrics = this.getMetrics('database:queries');
    const filteredMetrics = this.filterByTimeRange(metrics, timeRange);

    if (filteredMetrics.length === 0) {
      return null;
    }

    return {
      totalQueries: filteredMetrics.length,
      averageExecutionTime: this.calculateAverage(filteredMetrics, 'executionTime'),
      maxExecutionTime: this.calculateMax(filteredMetrics, 'executionTime'),
      minExecutionTime: this.calculateMin(filteredMetrics, 'executionTime'),
      averageRowsAffected: this.calculateAverage(filteredMetrics, 'rowsAffected'),
      slowQueries: filteredMetrics.filter(m => m.executionTime > 1000).length,
    };
  }

  /**
   * 获取缓存性能统计
   */
  getCachePerformanceStats(cacheType?: string, timeRange?: string) {
    const prefix = cacheType ? `cache:${cacheType}` : 'cache:';
    const metrics = this.getMetricsByPrefix(prefix);
    const filteredMetrics = this.filterByTimeRange(metrics, timeRange);

    if (filteredMetrics.length === 0) {
      return null;
    }

    return {
      totalOperations: filteredMetrics.length,
      averageHitRate: this.calculateAverage(filteredMetrics, 'hitRate'),
      averageResponseTime: this.calculateAverage(filteredMetrics, 'responseTime'),
      hitOperations: filteredMetrics.filter(m => m.hitRate > 0).length,
      missOperations: filteredMetrics.filter(m => m.hitRate === 0).length,
    };
  }

  /**
   * 获取系统资源使用情况
   */
  getSystemResourceStats(timeRange?: string) {
    const metrics = this.getMetrics('system:resources');
    const filteredMetrics = this.filterByTimeRange(metrics, timeRange);

    if (filteredMetrics.length === 0) {
      return null;
    }

    return {
      averageCpuUsage: this.calculateAverage(filteredMetrics, 'cpu'),
      maxCpuUsage: this.calculateMax(filteredMetrics, 'cpu'),
      averageMemoryUsage: this.calculateAverage(filteredMetrics, 'memory'),
      maxMemoryUsage: this.calculateMax(filteredMetrics, 'memory'),
      averageDiskUsage: this.calculateAverage(filteredMetrics, 'disk'),
      maxDiskUsage: this.calculateMax(filteredMetrics, 'disk'),
    };
  }

  /**
   * 获取性能趋势数据
   */
  getPerformanceTrends(metricType: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const key = this.getMetricKey(metricType);
    const metrics = this.getMetrics(key);

    const filteredMetrics = metrics.filter(m => m.timestamp >= startDate && m.timestamp <= endDate);

    // 按小时分组
    const groupedMetrics = this.groupByHour(filteredMetrics);

    return Object.keys(groupedMetrics)
      .map(hour => ({
        timestamp: hour,
        value: this.calculateAverage(groupedMetrics[hour], this.getValueField(metricType)),
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private addMetric(key: string, metric: any) {
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }

    const metrics = this.performanceMetrics.get(key);
    metrics.push(metric);

    // 限制存储的指标数量
    if (metrics.length > this.maxMetricsCount) {
      metrics.shift();
    }
  }

  private getMetrics(key: string): any[] {
    return this.performanceMetrics.get(key) || [];
  }

  private getMetricsByPrefix(prefix: string): any[] {
    const result: any[] = [];
    for (const [key, metrics] of this.performanceMetrics.entries()) {
      if (key.startsWith(prefix)) {
        result.push(...metrics);
      }
    }
    return result;
  }

  private filterByTimeRange(metrics: any[], timeRange?: string): any[] {
    if (!timeRange) {
      return metrics;
    }

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return metrics;
    }

    return metrics.filter(m => m.timestamp >= startDate);
  }

  private calculateAverage(metrics: any[], field: string): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + (m[field] || 0), 0);
    return Math.round((sum / metrics.length) * 100) / 100;
  }

  private calculateMax(metrics: any[], field: string): number {
    if (metrics.length === 0) return 0;
    return Math.max(...metrics.map(m => m[field] || 0));
  }

  private calculateMin(metrics: any[], field: string): number {
    if (metrics.length === 0) return 0;
    return Math.min(...metrics.map(m => m[field] || 0));
  }

  private calculateSuccessRate(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const successCount = metrics.filter(m => m.statusCode >= 200 && m.statusCode < 300).length;
    return Math.round((successCount / metrics.length) * 10000) / 100;
  }

  private calculateRequestsPerMinute(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const timeSpan = (metrics[metrics.length - 1].timestamp - metrics[0].timestamp) / (1000 * 60);
    return timeSpan > 0 ? Math.round((metrics.length / timeSpan) * 100) / 100 : 0;
  }

  private groupByHour(metrics: any[]): { [hour: string]: any[] } {
    const grouped: { [hour: string]: any[] } = {};

    metrics.forEach(metric => {
      const hour = new Date(metric.timestamp).toISOString().substring(0, 13) + ':00:00.000Z';
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(metric);
    });

    return grouped;
  }

  private getMetricKey(metricType: string): string {
    switch (metricType) {
      case 'api_response_time':
        return 'api:';
      case 'database_execution_time':
        return 'database:queries';
      case 'cache_hit_rate':
        return 'cache:';
      case 'system_cpu':
      case 'system_memory':
      case 'system_disk':
        return 'system:resources';
      default:
        return metricType;
    }
  }

  private getValueField(metricType: string): string {
    switch (metricType) {
      case 'api_response_time':
        return 'responseTime';
      case 'database_execution_time':
        return 'executionTime';
      case 'cache_hit_rate':
        return 'hitRate';
      case 'system_cpu':
        return 'cpu';
      case 'system_memory':
        return 'memory';
      case 'system_disk':
        return 'disk';
      default:
        return 'value';
    }
  }

  private getCpuUsage(): number {
    // 模拟CPU使用率，实际项目中应该使用系统监控库
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    // 模拟内存使用率，实际项目中应该使用系统监控库
    return Math.random() * 100;
  }

  private getDiskUsage(): number {
    // 模拟磁盘使用率，实际项目中应该使用系统监控库
    return Math.random() * 100;
  }
}
