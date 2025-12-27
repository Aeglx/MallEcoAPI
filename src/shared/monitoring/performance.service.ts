import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

@Injectable()
export class PerformanceService implements OnModuleInit {
  private registry: Registry;

  // API性能指标
  private apiRequestCounter: Counter<string>;
  private apiResponseTimeHistogram: Histogram<string>;
  private apiErrorCounter: Counter<string>;

  // 数据库性能指标
  private dbQueryCounter: Counter<string>;
  private dbQueryTimeHistogram: Histogram<string>;

  // 系统资源指标
  private memoryUsageGauge: Gauge<string>;
  private cpuUsageGauge: Gauge<string>;
  private activeRequestsGauge: Gauge<string>;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  onModuleInit() {
    this.startSystemMetricsCollection();
  }

  private initializeMetrics() {
    // API请求计数器
    this.apiRequestCounter = new Counter({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    // API响应时间直方图
    this.apiResponseTimeHistogram = new Histogram({
      name: 'api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // API错误计数器
    this.apiErrorCounter = new Counter({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['method', 'path', 'error_type'],
      registers: [this.registry],
    });

    // 数据库查询计数器
    this.dbQueryCounter = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table'],
      registers: [this.registry],
    });

    // 数据库查询时间直方图
    this.dbQueryTimeHistogram = new Histogram({
      name: 'db_query_time_seconds',
      help: 'Database query time in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.registry],
    });

    // 内存使用量
    this.memoryUsageGauge = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      registers: [this.registry],
    });

    // CPU使用率
    this.cpuUsageGauge = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.registry],
    });

    // 活跃请求数
    this.activeRequestsGauge = new Gauge({
      name: 'active_requests',
      help: 'Number of active requests',
      registers: [this.registry],
    });
  }

  private startSystemMetricsCollection() {
    // 定期收集系统指标
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // 每30秒收集一次
  }

  private collectSystemMetrics() {
    // 收集内存使用情况
    const memoryUsage = process.memoryUsage();
    this.memoryUsageGauge.set(memoryUsage.heapUsed);

    // 收集CPU使用情况（简化版本）
    const cpuUsage = process.cpuUsage();
    this.cpuUsageGauge.set(cpuUsage.user / 1000000); // 转换为百分比
  }

  // API性能监控方法
  recordApiRequest(method: string, path: string, duration: number, status: number) {
    this.apiRequestCounter.labels(method, path, status.toString()).inc();
    this.apiResponseTimeHistogram.labels(method, path, status.toString()).observe(duration);

    if (status >= 400) {
      const errorType = status >= 500 ? 'server_error' : 'client_error';
      this.apiErrorCounter.labels(method, path, errorType).inc();
    }
  }

  // 数据库性能监控方法
  recordDbQuery(operation: string, table: string, duration: number) {
    this.dbQueryCounter.labels(operation, table).inc();
    this.dbQueryTimeHistogram.labels(operation, table).observe(duration);
  }

  // 活跃请求监控
  incrementActiveRequests() {
    this.activeRequestsGauge.inc();
  }

  decrementActiveRequests() {
    this.activeRequestsGauge.dec();
  }

  // 获取指标数据
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  // 重置指标（用于测试）
  resetMetrics() {
    this.registry.resetMetrics();
  }

  // 获取性能统计摘要
  getPerformanceSummary() {
    return {
      apiRequests: this.apiRequestCounter.get(),
      apiErrors: this.apiErrorCounter.get(),
      dbQueries: this.dbQueryCounter.get(),
      memoryUsage: this.memoryUsageGauge.get(),
      cpuUsage: this.cpuUsageGauge.get(),
      activeRequests: this.activeRequestsGauge.get(),
    };
  }
}
