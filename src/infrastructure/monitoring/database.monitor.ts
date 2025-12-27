import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as promClient from 'prom-client';

export interface DatabaseMetrics {
  queryCount: number;
  slowQueryCount: number;
  connectionCount: number;
  tableSize: number;
  indexUsage: number;
  lockWaitTime: number;
  bufferPoolUsage: number;
}

interface AlertRule {
  name: string;
  condition: (metrics: DatabaseMetrics) => boolean;
  severity: 'warning' | 'critical';
  message: string;
}

@Injectable()
export class DatabaseMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseMonitorService.name);
  private monitoringInterval: NodeJS.Timeout;
  private metrics: Map<string, DatabaseMetrics> = new Map();

  // Prometheus指标
  private queryCounter: promClient.Counter;
  private slowQueryCounter: promClient.Counter;
  private connectionGauge: promClient.Gauge;
  private tableSizeGauge: promClient.Gauge;
  private indexUsageGauge: promClient.Gauge;
  private lockWaitGauge: promClient.Gauge;
  private bufferPoolGauge: promClient.Gauge;

  // 告警规则
  private alertRules: AlertRule[] = [
    {
      name: 'high_slow_queries',
      condition: metrics => metrics.slowQueryCount > 10,
      severity: 'warning',
      message: 'High number of slow queries detected',
    },
    {
      name: 'high_connection_count',
      condition: metrics => metrics.connectionCount > 100,
      severity: 'critical',
      message: 'High database connection count detected',
    },
    {
      name: 'large_table_size',
      condition: metrics => metrics.tableSize > 10737418240, // 10GB
      severity: 'warning',
      message: 'Large table size detected, consider archiving',
    },
    {
      name: 'low_index_usage',
      condition: metrics => metrics.indexUsage < 0.8,
      severity: 'warning',
      message: 'Low index usage detected, consider optimizing queries',
    },
    {
      name: 'high_lock_wait',
      condition: metrics => metrics.lockWaitTime > 5000, // 5 seconds
      severity: 'critical',
      message: 'High lock wait time detected',
    },
  ];

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeMetrics();
  }

  async onModuleInit() {
    await this.startMonitoring();
    this.logger.log('Database monitoring service started');
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  /**
   * 初始化Prometheus指标
   */
  private initializeMetrics() {
    this.queryCounter = new promClient.Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['type', 'table'],
    });

    this.slowQueryCounter = new promClient.Counter({
      name: 'database_slow_queries_total',
      help: 'Total number of slow queries',
      labelNames: ['table'],
    });

    this.connectionGauge = new promClient.Gauge({
      name: 'database_connections_current',
      help: 'Current number of database connections',
    });

    this.tableSizeGauge = new promClient.Gauge({
      name: 'database_table_size_bytes',
      help: 'Size of database tables in bytes',
      labelNames: ['table'],
    });

    this.indexUsageGauge = new promClient.Gauge({
      name: 'database_index_usage_ratio',
      help: 'Index usage ratio (0-1)',
    });

    this.lockWaitGauge = new promClient.Gauge({
      name: 'database_lock_wait_time_ms',
      help: 'Lock wait time in milliseconds',
    });

    this.bufferPoolGauge = new promClient.Gauge({
      name: 'database_buffer_pool_usage_ratio',
      help: 'Buffer pool usage ratio (0-1)',
    });
  }

  /**
   * 开始监控
   */
  async startMonitoring() {
    // 每30秒收集一次指标
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
      } catch (error) {
        this.logger.error('Failed to collect database metrics', error);
      }
    }, 30000);

    // 立即执行一次指标收集
    await this.collectMetrics();
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  /**
   * 收集数据库指标
   */
  private async collectMetrics() {
    const timestamp = new Date().toISOString();
    const metrics: DatabaseMetrics = {
      queryCount: 0,
      slowQueryCount: 0,
      connectionCount: 0,
      tableSize: 0,
      indexUsage: 0,
      lockWaitTime: 0,
      bufferPoolUsage: 0,
    };

    try {
      // 获取连接数
      const connectionResult = await this.connection.query("SHOW STATUS LIKE 'Threads_connected'");
      metrics.connectionCount = parseInt(connectionResult[0]?.Value || '0');
      this.connectionGauge.set(metrics.connectionCount);

      // 获取表大小
      const sizeResult = await this.connection.query(
        `
        SELECT 
          table_name,
          ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb
        FROM information_schema.tables 
        WHERE table_schema = ?
        ORDER BY (data_length + index_length) DESC
        LIMIT 10
      `,
        [this.connection.options.database],
      );

      metrics.tableSize = sizeResult.reduce(
        (total: number, table: any) => total + table.size_mb * 1024 * 1024,
        0,
      );

      // 更新表大小指标
      sizeResult.forEach((table: any) => {
        this.tableSizeGauge.set({ table: table.table_name }, table.size_mb * 1024 * 1024);
      });

      // 获取索引使用情况
      const indexResult = await this.connection.query(
        `
        SELECT 
          TABLE_NAME,
          INDEX_NAME,
          SEQ_IN_INDEX
        FROM information_schema.statistics 
        WHERE table_schema = ?
      `,
        [this.connection.options.database],
      );

      metrics.indexUsage = indexResult.length > 0 ? 0.9 : 0.5; // 简化计算
      this.indexUsageGauge.set(metrics.indexUsage);

      // 获取锁等待时间
      const lockResult = await this.connection.query("SHOW STATUS LIKE 'Innodb_row_lock_time_max'");
      metrics.lockWaitTime = parseInt(lockResult[0]?.Value || '0');
      this.lockWaitGauge.set(metrics.lockWaitTime);

      // 获取缓冲池使用情况
      const bufferResult = await this.connection.query(
        "SHOW STATUS LIKE 'Innodb_buffer_pool_pages_%'",
      );

      const bufferPoolData = bufferResult.reduce((acc: any, row: any) => {
        acc[row.Variable_name] = parseInt(row.Value);
        return acc;
      }, {});

      if (bufferPoolData.Innodb_buffer_pool_pages_total > 0) {
        metrics.bufferPoolUsage =
          bufferPoolData.Innodb_buffer_pool_pages_data /
          bufferPoolData.Innodb_buffer_pool_pages_total;
        this.bufferPoolGauge.set(metrics.bufferPoolUsage);
      }

      // 获取慢查询统计
      const slowQueryResult = await this.connection.query("SHOW STATUS LIKE 'Slow_queries'");
      metrics.slowQueryCount = parseInt(slowQueryResult[0]?.Value || '0');

      this.metrics.set(timestamp, metrics);

      // 清理旧的指标数据（保留最近1小时）
      this.cleanupOldMetrics();
    } catch (error) {
      this.logger.error('Failed to collect database metrics', error);
    }
  }

  /**
   * 检查告警
   */
  private async checkAlerts() {
    const latestMetrics = Array.from(this.metrics.values()).pop();

    if (!latestMetrics) return;

    for (const rule of this.alertRules) {
      if (rule.condition(latestMetrics)) {
        await this.triggerAlert(rule, latestMetrics);
      }
    }
  }

  /**
   * 触发告警
   */
  private async triggerAlert(rule: AlertRule, metrics: DatabaseMetrics) {
    const alertData = {
      rule: rule.name,
      severity: rule.severity,
      message: rule.message,
      metrics: metrics,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(`Database alert triggered: ${JSON.stringify(alertData)}`);

    // 发送事件给事件发射器
    this.eventEmitter.emit('database.alert', alertData);

    // 记录到数据库
    await this.recordAlert(alertData);
  }

  /**
   * 记录告警到数据库
   */
  private async recordAlert(alertData: any) {
    try {
      await this.connection.query(
        `INSERT INTO mall_database_alerts 
         (alert_rule, severity, message, metrics, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          alertData.rule,
          alertData.severity,
          alertData.message,
          JSON.stringify(alertData.metrics),
          alertData.timestamp,
        ],
      );
    } catch (error) {
      this.logger.error('Failed to record alert to database', error);
    }
  }

  /**
   * 清理旧的指标数据
   */
  private cleanupOldMetrics() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    for (const [timestamp] of this.metrics) {
      if (timestamp < oneHourAgo) {
        this.metrics.delete(timestamp);
      }
    }
  }

  /**
   * 获取当前指标
   */
  getCurrentMetrics(): DatabaseMetrics | null {
    const values = Array.from(this.metrics.values());
    return values.length > 0 ? values[values.length - 1] : null;
  }

  /**
   * 获取指标历史
   */
  getMetricsHistory(minutes: number = 60): Map<string, DatabaseMetrics> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    const filteredMetrics = new Map();

    for (const [timestamp, metrics] of this.metrics) {
      if (timestamp >= cutoffTime) {
        filteredMetrics.set(timestamp, metrics);
      }
    }

    return filteredMetrics;
  }

  /**
   * 手动触发性能分析
   */
  async runPerformanceAnalysis(): Promise<any> {
    try {
      const analysis = {
        tableSizes: await this.connection.query(
          `
          SELECT 
            table_name,
            ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb,
            table_rows
          FROM information_schema.tables 
          WHERE table_schema = ?
          ORDER BY (data_length + index_length) DESC
        `,
          [this.connection.options.database],
        ),

        indexUsage: await this.connection.query(
          `
          SELECT 
            table_name,
            index_name,
            non_unique,
            seq_in_index,
            column_name
          FROM information_schema.statistics 
          WHERE table_schema = ?
          ORDER BY table_name, index_name, seq_in_index
        `,
          [this.connection.options.database],
        ),

        queryPerformance: await this.connection.query(`
          SELECT 
            query,
            db,
            exec_count,
            total_latency,
            avg_latency,
            max_latency
          FROM sys.x$statement_analysis 
          ORDER BY total_latency DESC 
          LIMIT 10
        `),

        connectionInfo: await this.connection.query('SHOW PROCESSLIST'),
      };

      return analysis;
    } catch (error) {
      this.logger.error('Failed to run performance analysis', error);
      throw error;
    }
  }

  /**
   * 定时清理旧的告警记录
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAlerts() {
    try {
      await this.connection.query(
        'DELETE FROM mall_database_alerts WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)',
      );
      this.logger.log('Cleaned up old database alerts');
    } catch (error) {
      this.logger.error('Failed to cleanup old alerts', error);
    }
  }

  /**
   * 导出Prometheus指标
   */
  async getMetrics(): Promise<string> {
    return await promClient.register.metrics();
  }
}
