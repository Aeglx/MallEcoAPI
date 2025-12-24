import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface BusinessMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface MetricAggregation {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  timestamp: Date;
}

interface BusinessAlert {
  id: string;
  type: 'THRESHOLD' | 'TREND' | 'ANOMALY';
  metric: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  resolved: boolean;
}

interface MetricThreshold {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

@Injectable()
export class BusinessMetricsService {
  private readonly logger = new Logger(BusinessMetricsService.name);
  private readonly metrics = new Map<string, BusinessMetric[]>();
  private readonly aggregations = new Map<string, MetricAggregation>();
  private readonly alerts = new Map<string, BusinessAlert>();
  private readonly thresholds: Map<string, MetricThreshold[]> = new Map();

  // 业务指标定义
  private readonly metricDefinitions = {
    // 用户相关指标
    user_registrations: { unit: 'count', aggregation: 'sum' },
    user_login_success: { unit: 'count', aggregation: 'sum' },
    user_login_failure: { unit: 'count', aggregation: 'sum' },
    user_active_daily: { unit: 'count', aggregation: 'sum' },
    
    // 商品相关指标
    product_views: { unit: 'count', aggregation: 'sum' },
    product_add_to_cart: { unit: 'count', aggregation: 'sum' },
    product_purchases: { unit: 'count', aggregation: 'sum' },
    product_inventory_changes: { unit: 'count', aggregation: 'sum' },
    
    // 订单相关指标
    order_created: { unit: 'count', aggregation: 'sum' },
    order_completed: { unit: 'count', aggregation: 'sum' },
    order_cancelled: { unit: 'count', aggregation: 'sum' },
    order_revenue: { unit: 'currency', aggregation: 'sum' },
    
    // 分销相关指标
    distributor_registrations: { unit: 'count', aggregation: 'sum' },
    distributor_commissions: { unit: 'currency', aggregation: 'sum' },
    distribution_sales: { unit: 'currency', aggregation: 'sum' },
    
    // 性能相关指标
    api_response_time: { unit: 'ms', aggregation: 'avg' },
    api_error_rate: { unit: 'percent', aggregation: 'avg' },
    cache_hit_rate: { unit: 'percent', aggregation: 'avg' },
    
    // 业务流程指标
    checkout_conversion_rate: { unit: 'percent', aggregation: 'avg' },
    cart_abandonment_rate: { unit: 'percent', aggregation: 'avg' },
    user_retention_rate: { unit: 'percent', aggregation: 'avg' },
  };

  constructor() {
    this.initializeThresholds();
    this.startMetricsProcessing();
  }

  /**
   * 记录业务指标
   */
  recordMetric(
    name: string, 
    value: number, 
    tags?: Record<string, string>
  ): void {
    const metric: BusinessMetric = {
      name,
      value,
      unit: this.metricDefinitions[name]?.unit || 'count',
      timestamp: new Date(),
      tags,
    };

    // 存储指标
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metricList = this.metrics.get(name)!;
    metricList.push(metric);
    
    // 保留最近1小时的数据（假设每秒一个数据点）
    const maxAge = 3600 * 1000;
    const now = Date.now();
    const filtered = metricList.filter(m => now - m.timestamp.getTime() < maxAge);
    this.metrics.set(name, filtered);

    // 检查阈值告警
    this.checkThresholds(metric);
  }

  /**
   * 增量记录指标
   */
  incrementMetric(
    name: string, 
    increment: number = 1, 
    tags?: Record<string, string>
  ): void {
    // 获取当前值并增加
    const currentValue = this.getCurrentMetricValue(name) || 0;
    this.recordMetric(name, currentValue + increment, tags);
  }

  /**
   * 记录计时指标
   */
  recordTiming(
    name: string, 
    duration: number, 
    tags?: Record<string, string>
  ): void {
    this.recordMetric(`${name}_duration`, duration, tags);
    this.recordMetric(name, 1, tags); // 计数
  }

  /**
   * 记录成功率
   */
  recordSuccessRate(
    name: string, 
    success: boolean, 
    tags?: Record<string, string>
  ): void {
    const rate = success ? 100 : 0;
    this.recordMetric(`${name}_success_rate`, rate, tags);
    this.recordMetric(`${name}_attempts`, 1, tags);
  }

  /**
   * 获取当前指标值
   */
  getCurrentMetricValue(name: string): number | null {
    const metricList = this.metrics.get(name);
    return metricList && metricList.length > 0 
      ? metricList[metricList.length - 1].value 
      : null;
  }

  /**
   * 获取指标聚合数据
   */
  getMetricAggregation(
    name: string, 
    windowMinutes: number = 5
  ): MetricAggregation | null {
    const metricList = this.metrics.get(name);
    if (!metricList || metricList.length === 0) {
      return null;
    }

    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    // 过滤时间窗口内的数据
    const filtered = metricList.filter(m => 
      now - m.timestamp.getTime() < windowMs
    );

    if (filtered.length === 0) {
      return null;
    }

    // 计算聚合统计
    const values = filtered.map(m => m.value);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = sum / count;

    return {
      name,
      count,
      sum,
      min,
      max,
      avg,
      timestamp: new Date(),
    };
  }

  /**
   * 获取业务指标仪表板数据
   */
  getDashboardData(): any {
    const now = new Date();
    const dashboard = {};

    // 核心业务指标
    const coreMetrics = [
      'user_active_daily',
      'product_views',
      'order_created',
      'order_revenue',
      'api_response_time',
      'cache_hit_rate',
    ];

    for (const metric of coreMetrics) {
      const current = this.getCurrentMetricValue(metric);
      const aggregation = this.getMetricAggregation(metric, 60); // 1小时
      const trend = this.calculateTrend(metric, 60); // 1小时趋势
      
      dashboard[metric] = {
        current,
        aggregation,
        trend,
        unit: this.metricDefinitions[metric]?.unit || 'count',
      };
    }

    // 告警信息
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => !alert.resolved);
    
    return {
      timestamp: now,
      metrics: dashboard,
      alerts: activeAlerts,
      health: this.calculateBusinessHealth(),
    };
  }

  /**
   * 获取实时告警
   */
  getActiveAlerts(): BusinessAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.logger.log(`告警已解决: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * 自定义业务指标阈值
   */
  setThreshold(threshold: MetricThreshold): void {
    if (!this.thresholds.has(threshold.metric)) {
      this.thresholds.set(threshold.metric, []);
    }
    
    this.thresholds.get(threshold.metric)!.push(threshold);
    this.logger.log(`设置指标阈值: ${threshold.metric} ${threshold.operator} ${threshold.value}`);
  }

  /**
   * 生成业务报告
   */
  generateReport(startDate: Date, endDate: Date): any {
    const report = {
      period: { start: startDate, end: endDate },
      summary: {},
      trends: {},
      alerts: [],
    };

    // 生成各项指标的汇总
    for (const metricName of Object.keys(this.metricDefinitions)) {
      const aggregation = this.calculatePeriodAggregation(metricName, startDate, endDate);
      if (aggregation) {
        report.summary[metricName] = aggregation;
      }
      
      const trend = this.calculateTrend(metricName, 
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60))
      );
      if (trend) {
        report.trends[metricName] = trend;
      }
    }

    // 收集期间的告警
    for (const alert of this.alerts.values()) {
      if (alert.timestamp >= startDate && alert.timestamp <= endDate) {
        report.alerts.push(alert);
      }
    }

    return report;
  }

  /**
   * 初始化默认阈值
   */
  private initializeThresholds(): void {
    const defaultThresholds: MetricThreshold[] = [
      // API性能阈值
      {
        metric: 'api_response_time',
        operator: '>',
        value: 2000,
        severity: 'HIGH',
        message: 'API响应时间过长',
      },
      {
        metric: 'api_error_rate',
        operator: '>',
        value: 5,
        severity: 'MEDIUM',
        message: 'API错误率过高',
      },
      
      // 缓存性能阈值
      {
        metric: 'cache_hit_rate',
        operator: '<',
        value: 80,
        severity: 'MEDIUM',
        message: '缓存命中率过低',
      },
      
      // 业务阈值
      {
        metric: 'order_revenue',
        operator: '<',
        value: 1000,
        severity: 'LOW',
        message: '订单收入偏低',
      },
      {
        metric: 'user_login_failure',
        operator: '>',
        value: 50,
        severity: 'HIGH',
        message: '用户登录失败次数过多',
      },
    ];

    for (const threshold of defaultThresholds) {
      this.setThreshold(threshold);
    }
  }

  /**
   * 启动指标处理
   */
  private startMetricsProcessing(): void {
    // 每分钟聚合指标
    setInterval(() => {
      this.aggregateMetrics();
    }, 60000);

    // 每5分钟清理过期数据
    setInterval(() => {
      this.cleanupOldData();
    }, 300000);
  }

  /**
   * 聚合指标数据
   */
  private aggregateMetrics(): void {
    for (const [metricName, metricList] of this.metrics) {
      if (metricList.length === 0) continue;
      
      const definition = this.metricDefinitions[metricName];
      if (!definition) continue;

      const now = Date.now();
      const windowMs = 5 * 60 * 1000; // 5分钟窗口
      const filtered = metricList.filter(m => now - m.timestamp.getTime() < windowMs);
      
      if (filtered.length === 0) continue;

      const values = filtered.map(m => m.value);
      let aggregatedValue = 0;

      switch (definition.aggregation) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
      }

      const aggregation: MetricAggregation = {
        name: metricName,
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        timestamp: new Date(),
      };

      this.aggregations.set(metricName, aggregation);
    }
  }

  /**
   * 清理过期数据
   */
  private cleanupOldData(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    const now = Date.now();

    for (const [metricName, metricList] of this.metrics) {
      const filtered = metricList.filter(m => 
        now - m.timestamp.getTime() < maxAge
      );
      this.metrics.set(metricName, filtered);
    }
  }

  /**
   * 检查阈值告警
   */
  private checkThresholds(metric: BusinessMetric): void {
    const thresholds = this.thresholds.get(metric.name);
    if (!thresholds) return;

    for (const threshold of thresholds) {
      let triggered = false;

      switch (threshold.operator) {
        case '>':
          triggered = metric.value > threshold.value;
          break;
        case '<':
          triggered = metric.value < threshold.value;
          break;
        case '>=':
          triggered = metric.value >= threshold.value;
          break;
        case '<=':
          triggered = metric.value <= threshold.value;
          break;
        case '=':
          triggered = metric.value === threshold.value;
          break;
      }

      if (triggered) {
        this.createAlert(metric, threshold);
      }
    }
  }

  /**
   * 创建告警
   */
  private createAlert(metric: BusinessMetric, threshold: MetricThreshold): void {
    const alertId = `${metric.name}_${Date.now()}`;
    const alert: BusinessAlert = {
      id: alertId,
      type: 'THRESHOLD',
      metric: metric.name,
      message: threshold.message.replace('{value}', metric.value.toString()),
      severity: threshold.severity,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.set(alertId, alert);
    this.logger.warn(`业务告警: ${alert.message}`, { metric, value: metric.value });
  }

  /**
   * 计算趋势
   */
  private calculateTrend(metricName: string, windowMinutes: number): number | null {
    const metricList = this.metrics.get(metricName);
    if (!metricList || metricList.length < 2) return null;

    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const recent = metricList.filter(m => now - m.timestamp.getTime() < windowMs);
    
    if (recent.length < 2) return null;

    // 简单线性回归计算趋势
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDiff = last.timestamp.getTime() - first.timestamp.getTime();
    const valueDiff = last.value - first.value;
    
    return timeDiff > 0 ? (valueDiff / timeDiff) * 60000 : 0; // 每分钟变化率
  }

  /**
   * 计算业务健康评分
   */
  private calculateBusinessHealth(): number {
    let score = 100;
    
    // API响应时间影响
    const responseTime = this.getCurrentMetricValue('api_response_time');
    if (responseTime > 2000) score -= 20;
    else if (responseTime > 1000) score -= 10;
    
    // 错误率影响
    const errorRate = this.getCurrentMetricValue('api_error_rate');
    if (errorRate > 10) score -= 30;
    else if (errorRate > 5) score -= 15;
    
    // 缓存命中率影响
    const cacheHitRate = this.getCurrentMetricValue('cache_hit_rate');
    if (cacheHitRate < 70) score -= 20;
    else if (cacheHitRate < 85) score -= 10;
    
    // 活跃告警影响
    const activeAlerts = this.getActiveAlerts();
    score -= activeAlerts.filter(a => a.severity === 'CRITICAL').length * 10;
    score -= activeAlerts.filter(a => a.severity === 'HIGH').length * 5;
    
    return Math.max(0, score);
  }

  /**
   * 计算期间聚合
   */
  private calculatePeriodAggregation(
    metricName: string, 
    startDate: Date, 
    endDate: Date
  ): MetricAggregation | null {
    const metricList = this.metrics.get(metricName);
    if (!metricList) return null;

    const filtered = metricList.filter(m => 
      m.timestamp >= startDate && m.timestamp <= endDate
    );

    if (filtered.length === 0) return null;

    const values = filtered.map(m => m.value);
    return {
      name: metricName,
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      timestamp: new Date(),
    };
  }
}