import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Gauge, Counter, Histogram } from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private registry: Registry;

  // 应用指标
  private requestCounter: Counter;
  private responseTimeHistogram: Histogram;
  private activeConnectionsGauge: Gauge;
  private memoryUsageGauge: Gauge;
  private cpuUsageGauge: Gauge;

  // 业务指标
  private orderCounter: Counter;
  private paymentCounter: Counter;
  private userCounter: Counter;
  private cacheHitCounter: Counter;
  private cacheMissCounter: Counter;

  // 数据库指标
  private databaseQueryCounter: Counter;
  private databaseQueryDurationHistogram: Histogram;
  private databaseErrorCounter: Counter;
  private databasePoolConnectionsGauge: Gauge;

  constructor() {
    this.registry = new Registry();
    this.initMetrics();
  }

  async onModuleInit() {
    // 收集默认指标
    collectDefaultMetrics({ register: this.registry });

    // 启动指标收集定时任务
    this.startMetricsCollection();
  }

  private initMetrics() {
    // 应用指标
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.responseTimeHistogram = new Histogram({
      name: 'http_response_time_seconds',
      help: 'HTTP response time in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.activeConnectionsGauge = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });

    this.memoryUsageGauge = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cpuUsageGauge = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.registry],
    });

    // 业务指标
    this.orderCounter = new Counter({
      name: 'orders_total',
      help: 'Total number of orders',
      labelNames: ['status', 'type'],
      registers: [this.registry],
    });

    this.paymentCounter = new Counter({
      name: 'payments_total',
      help: 'Total number of payments',
      labelNames: ['method', 'status'],
      registers: [this.registry],
    });

    this.userCounter = new Counter({
      name: 'users_total',
      help: 'Total number of users',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cacheHitCounter = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_name'],
      registers: [this.registry],
    });

    this.cacheMissCounter = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_name'],
      registers: [this.registry],
    });

    // 数据库指标
    this.databaseQueryCounter = new Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['query_type'],
      registers: [this.registry],
    });

    this.databaseQueryDurationHistogram = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['query_type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.databaseErrorCounter = new Counter({
      name: 'database_errors_total',
      help: 'Total number of database errors',
      labelNames: ['error_type'],
      registers: [this.registry],
    });

    this.databasePoolConnectionsGauge = new Gauge({
      name: 'database_pool_connections',
      help: 'Database connection pool statistics',
      labelNames: ['pool_type'],
      registers: [this.registry],
    });
  }

  private startMetricsCollection() {
    // 收集内存使用情况
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      this.memoryUsageGauge.set({ type: 'rss' }, memoryUsage.rss);
      this.memoryUsageGauge.set({ type: 'heap_total' }, memoryUsage.heapTotal);
      this.memoryUsageGauge.set({ type: 'heap_used' }, memoryUsage.heapUsed);
      this.memoryUsageGauge.set({ type: 'external' }, memoryUsage.external);
    }, 5000);

    // 收集CPU使用情况
    setInterval(() => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = (endUsage.user + endUsage.system) / 1000000; // 转换为毫秒
        const percentage = (totalUsage / 500) * 100; // 5秒间隔
        this.cpuUsageGauge.set(Math.min(percentage, 100));
      }, 500);
    }, 5000);

    // 收集活跃连接数（需要根据实际实现调整）
    setInterval(() => {
      // 这里可以集成实际的连接监控
      this.activeConnectionsGauge.set(0);
    }, 10000);
  }

  // 记录HTTP请求
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.requestCounter.inc({ method, route, status_code: statusCode.toString() });
    this.responseTimeHistogram.observe({ method, route }, duration / 1000); // 转换为秒
  }

  // 记录业务指标
  recordOrder(status: string, type: string = 'normal') {
    this.orderCounter.inc({ status, type });
  }

  recordPayment(method: string, status: string) {
    this.paymentCounter.inc({ method, status });
  }

  recordUser(type: string) {
    this.userCounter.inc({ type });
  }

  recordCacheHit(cacheName: string) {
    this.cacheHitCounter.inc({ cache_name: cacheName });
  }

  recordCacheMiss(cacheName: string) {
    this.cacheMissCounter.inc({ cache_name: cacheName });
  }

  // 获取指标数据
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  // 获取特定指标
  async getMetric(name: string): Promise<string> {
    return await this.registry.getSingleMetricAsString(name);
  }

  // 重置指标（用于测试）
  async resetMetrics(): Promise<void> {
    await this.registry.resetMetrics();
  }

  // 获取指标注册表
  getRegistry(): Registry {
    return this.registry;
  }

  // 获取缓存命中率
  getCacheHitRate(cacheName: string): Promise<number> {
    return new Promise(resolve => {
      // 这里可以实现缓存命中率计算逻辑
      resolve(0);
    });
  }

  // 获取应用健康状态
  getHealthStatus(): {
    status: string;
    memory: number;
    cpu: number;
    uptime: number;
  } {
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    return {
      status: memoryPercent < 80 ? 'healthy' : 'warning',
      memory: memoryPercent,
      cpu: 0, // 需要实际实现
      uptime: process.uptime(),
    };
  }

  // 数据库相关指标记录
  recordDatabaseQuery(queryType: string, duration: number) {
    this.databaseQueryCounter.inc({ query_type: queryType });
    this.databaseQueryDurationHistogram.observe({ query_type: queryType }, duration / 1000); // 转换为秒
  }

  recordSlowQuery() {
    // 使用专门的慢查询计数器
    this.databaseQueryCounter.inc({ query_type: 'SLOW_QUERY' });
  }

  recordDatabaseError(errorType: string) {
    this.databaseErrorCounter.inc({ error_type: errorType });
  }

  recordConnectionPoolStats(poolStats: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingClients: number;
  }) {
    this.databasePoolConnectionsGauge.set({ pool_type: 'total' }, poolStats.totalConnections);
    this.databasePoolConnectionsGauge.set({ pool_type: 'active' }, poolStats.activeConnections);
    this.databasePoolConnectionsGauge.set({ pool_type: 'idle' }, poolStats.idleConnections);
    this.databasePoolConnectionsGauge.set({ pool_type: 'waiting' }, poolStats.waitingClients);
  }
}
