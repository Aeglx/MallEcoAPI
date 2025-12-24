import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface PerformanceMetric {
  timestamp: number;
  metric: string;
  value: number;
  tags?: Record<string, any>;
}

interface OptimizationRule {
  name: string;
  condition: (metrics: PerformanceMetric[]) => boolean;
  action: () => Promise<void>;
  priority: 'low' | 'medium' | 'high';
  cooldown: number; // 冷却时间(ms)
  lastExecuted?: number;
}

@Injectable()
export class PerformanceOptimizerService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceOptimizerService.name);
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // 最大存储指标数量
  private readonly optimizationRules: OptimizationRule[] = [];
  private optimizationInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    this.initializeOptimizationRules();
    this.startOptimizationLoop();
    this.logger.log('Performance optimizer service initialized');
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: string, value: number, tags?: Record<string, any>): void {
    const metricData: PerformanceMetric = {
      timestamp: Date.now(),
      metric,
      value,
      tags,
    };

    this.metrics.push(metricData);
    
    // 保持指标数量在限制范围内
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics);
    }

    // 发出指标记录事件
    this.eventEmitter.emit('performance.metric.recorded', metricData);
  }

  /**
   * 获取性能指标
   */
  getMetrics(
    metric?: string,
    startTime?: number,
    endTime?: number,
  ): PerformanceMetric[] {
    let filtered = this.metrics;

    if (metric) {
      filtered = filtered.filter(m => m.metric === metric);
    }

    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime);
    }

    return filtered;
  }

  /**
   * 获取性能统计
   */
  getStats(metric: string, timeWindow: number = 60000): {
    avg: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const recentMetrics = this.getMetrics(metric, windowStart, now)
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (recentMetrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0, p95: 0, p99: 0 };
    }

    const sum = recentMetrics.reduce((a, b) => a + b, 0);
    const avg = sum / recentMetrics.length;
    const min = recentMetrics[0];
    const max = recentMetrics[recentMetrics.length - 1];
    
    const p95Index = Math.floor(recentMetrics.length * 0.95);
    const p99Index = Math.floor(recentMetrics.length * 0.99);
    
    return {
      avg,
      min,
      max,
      count: recentMetrics.length,
      p95: recentMetrics[p95Index],
      p99: recentMetrics[p99Index],
    };
  }

  /**
   * 初始化优化规则
   */
  private initializeOptimizationRules(): void {
    // 规则1: 高响应时间告警
    this.optimizationRules.push({
      name: 'high_response_time_alert',
      condition: (metrics) => {
        const responseTimeStats = this.getStats('api.response_time', 30000);
        return responseTimeStats.p95 > 1000; // 95%的请求超过1秒
      },
      action: async () => {
        this.logger.warn('High response time detected, consider optimizing database queries or increasing resources');
        this.eventEmitter.emit('performance.alert.high_response_time');
      },
      priority: 'high',
      cooldown: 60000, // 1分钟冷却
    });

    // 规则2: 内存使用过高告警
    this.optimizationRules.push({
      name: 'high_memory_usage_alert',
      condition: (metrics) => {
        const memoryMetrics = this.getMetrics('system.memory.usage', Date.now() - 60000);
        if (memoryMetrics.length === 0) return false;
        
        const avgUsage = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;
        return avgUsage > 80; // 平均内存使用率超过80%
      },
      action: async () => {
        this.logger.warn('High memory usage detected, consider optimizing memory usage or increasing memory');
        this.eventEmitter.emit('performance.alert.high_memory_usage');
      },
      priority: 'high',
      cooldown: 120000, // 2分钟冷却
    });

    // 规则3: 数据库连接池优化
    this.optimizationRules.push({
      name: 'database_pool_optimization',
      condition: (metrics) => {
        const poolMetrics = this.getMetrics('database.pool.waiting', Date.now() - 300000);
        if (poolMetrics.length === 0) return false;
        
        const waitingCounts = poolMetrics.map(m => m.value);
        const avgWaiting = waitingCounts.reduce((sum, val) => sum + val, 0) / waitingCounts.length;
        return avgWaiting > 5; // 平均等待连接数超过5
      },
      action: async () => {
        this.logger.log('Database pool optimization triggered');
        this.eventEmitter.emit('performance.optimize.database_pool');
      },
      priority: 'medium',
      cooldown: 300000, // 5分钟冷却
    });

    // 规则4: 缓存命中率优化
    this.optimizationRules.push({
      name: 'cache_hit_rate_optimization',
      condition: (metrics) => {
        const hitRateStats = this.getStats('cache.hit_rate', 600000);
        return hitRateStats.avg < 70; // 缓存命中率低于70%
      },
      action: async () => {
        this.logger.warn('Low cache hit rate detected, consider optimizing cache strategy');
        this.eventEmitter.emit('performance.optimize.cache_strategy');
      },
      priority: 'medium',
      cooldown: 600000, // 10分钟冷却
    });
  }

  /**
   * 启动优化循环
   */
  private startOptimizationLoop(): void {
    const interval = this.configService.get<number>('performance.optimizationInterval') || 30000;
    
    this.optimizationInterval = setInterval(() => {
      this.evaluateOptimizationRules();
    }, interval);
  }

  /**
   * 评估优化规则
   */
  private async evaluateOptimizationRules(): Promise<void> {
    const now = Date.now();

    for (const rule of this.optimizationRules) {
      // 检查冷却时间
      if (rule.lastExecuted && now - rule.lastExecuted < rule.cooldown) {
        continue;
      }

      // 检查规则条件
      if (rule.condition(this.metrics)) {
        try {
          this.logger.debug(`Executing optimization rule: ${rule.name}`);
          await rule.action();
          rule.lastExecuted = now;
        } catch (error) {
          this.logger.error(`Failed to execute optimization rule ${rule.name}:`, error);
        }
      }
    }
  }

  /**
   * 添加自定义优化规则
   */
  addOptimizationRule(rule: OptimizationRule): void {
    this.optimizationRules.push(rule);
    this.logger.debug(`Added custom optimization rule: ${rule.name}`);
  }

  /**
   * 获取系统健康状态
   */
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查响应时间
    const responseTimeStats = this.getStats('api.response_time', 300000);
    if (responseTimeStats.p95 > 2000) {
      issues.push('High response time detected');
      recommendations.push('Optimize database queries and consider horizontal scaling');
    }

    // 检查错误率
    const errorRateStats = this.getStats('api.error_rate', 300000);
    if (errorRateStats.avg > 5) {
      issues.push('High error rate detected');
      recommendations.push('Investigate error sources and implement proper error handling');
    }

    // 检查内存使用
    const memoryStats = this.getStats('system.memory.usage', 300000);
    if (memoryStats.avg > 85) {
      issues.push('High memory usage detected');
      recommendations.push('Optimize memory usage and consider increasing memory allocation');
    }

    // 确定状态
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      recommendations,
    };
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(timeWindow: number = 3600000): {
    summary: {
      totalRequests: number;
      avgResponseTime: number;
      errorRate: number;
      uptime: number;
    };
    metrics: Record<string, any>;
    recommendations: string[];
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const responseTimeStats = this.getStats('api.response_time', timeWindow);
    const errorRateStats = this.getStats('api.error_rate', timeWindow);
    
    const totalRequests = this.getMetrics('api.request_count', windowStart, now).length;

    return {
      summary: {
        totalRequests,
        avgResponseTime: responseTimeStats.avg,
        errorRate: errorRateStats.avg,
        uptime: process.uptime(),
      },
      metrics: {
        responseTime: responseTimeStats,
        errorRate: errorRateStats,
        memory: this.getStats('system.memory.usage', timeWindow),
        cpu: this.getStats('system.cpu.usage', timeWindow),
      },
      recommendations: this.getSystemHealth().recommendations,
    };
  }

  /**
   * 清理过期的指标数据
   */
  cleanupOldMetrics(retentionPeriod: number = 86400000): void { // 默认保留24小时
    const cutoffTime = Date.now() - retentionPeriod;
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffTime);
    
    const removedCount = initialLength - this.metrics.length;
    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} old metrics`);
    }
  }

  /**
   * 停止优化服务
   */
  async stop(): Promise<void> {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.logger.log('Performance optimizer service stopped');
    }
  }
}