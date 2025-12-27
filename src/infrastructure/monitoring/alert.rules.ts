import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  condition: (metrics: any) => boolean;
  cooldown: number; // 冷却时间（分钟）
  lastTriggered?: Date;
  enabled: boolean;
}

interface Alert {
  id: string;
  ruleId: string;
  severity: string;
  message: string;
  metrics: any;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

@Injectable()
export class AlertRulesService {
  private readonly logger = new Logger(AlertRulesService.name);
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeRules();
  }

  /**
   * 初始化告警规则
   */
  private initializeRules() {
    // 数据库连接相关告警
    this.addRule({
      id: 'high_connections',
      name: '高连接数告警',
      description: '数据库连接数超过阈值',
      severity: 'warning',
      condition: metrics => metrics.connectionCount > 800,
      cooldown: 30,
      enabled: true,
    });

    this.addRule({
      id: 'max_connections_reached',
      name: '最大连接数告警',
      description: '数据库连接数达到最大限制',
      severity: 'critical',
      condition: metrics => metrics.connectionCount > 950,
      cooldown: 10,
      enabled: true,
    });

    // 性能相关告警
    this.addRule({
      id: 'high_slow_queries',
      name: '高慢查询告警',
      description: '慢查询数量超过阈值',
      severity: 'warning',
      condition: metrics => metrics.slowQueryCount > 50,
      cooldown: 60,
      enabled: true,
    });

    this.addRule({
      id: 'very_high_slow_queries',
      name: '极高慢查询告警',
      description: '慢查询数量严重超标',
      severity: 'critical',
      condition: metrics => metrics.slowQueryCount > 200,
      cooldown: 15,
      enabled: true,
    });

    // 表空间相关告警
    this.addRule({
      id: 'large_table_size',
      name: '大表告警',
      description: '单个表大小超过阈值',
      severity: 'warning',
      condition: metrics => metrics.tableSize > 5368709120, // 5GB
      cooldown: 1440, // 24小时
      enabled: true,
    });

    this.addRule({
      id: 'very_large_table_size',
      name: '超大表告警',
      description: '单个表大小严重超标',
      severity: 'critical',
      condition: metrics => metrics.tableSize > 10737418240, // 10GB
      cooldown: 240, // 4小时
      enabled: true,
    });

    // 索引相关告警
    this.addRule({
      id: 'low_index_usage',
      name: '低索引使用率告警',
      description: '索引使用率过低',
      severity: 'warning',
      condition: metrics => metrics.indexUsage < 0.6,
      cooldown: 120,
      enabled: true,
    });

    // 锁等待告警
    this.addRule({
      id: 'high_lock_wait',
      name: '高锁等待时间告警',
      description: '锁等待时间过长',
      severity: 'critical',
      condition: metrics => metrics.lockWaitTime > 10000, // 10秒
      cooldown: 5,
      enabled: true,
    });

    // 缓冲池告警
    this.addRule({
      id: 'low_buffer_pool_hit',
      name: '低缓冲池命中率告警',
      description: '缓冲池命中率过低',
      severity: 'warning',
      condition: metrics => metrics.bufferPoolUsage < 0.8,
      cooldown: 60,
      enabled: true,
    });

    // 备份相关告警
    this.addRule({
      id: 'backup_failed',
      name: '备份失败告警',
      description: '数据库备份任务失败',
      severity: 'critical',
      condition: metrics => metrics.backupStatus === 'failed',
      cooldown: 60,
      enabled: true,
    });

    this.addRule({
      id: 'no_recent_backup',
      name: '无近期备份告警',
      description: '超过24小时没有成功备份',
      severity: 'warning',
      condition: metrics => {
        if (!metrics.lastBackupTime) return true;
        const lastBackup = new Date(metrics.lastBackupTime);
        const hoursSinceBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
        return hoursSinceBackup > 24;
      },
      cooldown: 720, // 12小时
      enabled: true,
    });

    // 连接中断告警
    this.addRule({
      id: 'connection_lost',
      name: '数据库连接中断告警',
      description: '无法连接到数据库',
      severity: 'critical',
      condition: metrics => metrics.connectionStatus === 'disconnected',
      cooldown: 1,
      enabled: true,
    });

    this.logger.log(`Initialized ${this.rules.size} alert rules`);
  }

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule);
  }

  /**
   * 检查指标并触发告警
   */
  checkMetrics(metrics: any): Alert[] {
    const triggeredAlerts: Alert[] = [];

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      // 检查冷却时间
      if (rule.lastTriggered) {
        const minutesSinceLastTrigger = (Date.now() - rule.lastTriggered.getTime()) / (1000 * 60);
        if (minutesSinceLastTrigger < rule.cooldown) {
          continue;
        }
      }

      // 检查条件
      if (rule.condition(metrics)) {
        const alert = this.triggerAlert(rule, metrics);
        triggeredAlerts.push(alert);

        // 更新最后触发时间
        rule.lastTriggered = new Date();
        this.rules.set(ruleId, rule);
      }
    }

    return triggeredAlerts;
  }

  /**
   * 触发告警
   */
  private triggerAlert(rule: AlertRule, metrics: any): Alert {
    const alertId = `${rule.id}_${Date.now()}`;
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      severity: rule.severity,
      message: this.formatAlertMessage(rule, metrics),
      metrics: metrics,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.activeAlerts.set(alertId, alert);

    // 发送事件
    this.eventEmitter.emit('alert.triggered', alert);

    // 发送通知
    this.sendNotification(alert);

    this.logger.warn(`Alert triggered: ${rule.name} - ${alert.message}`);

    return alert;
  }

  /**
   * 格式化告警消息
   */
  private formatAlertMessage(rule: AlertRule, metrics: any): string {
    switch (rule.id) {
      case 'high_connections':
        return `数据库连接数过高：${metrics.connectionCount}（阈值：800）`;

      case 'max_connections_reached':
        return `数据库连接数达到最大限制：${metrics.connectionCount}（阈值：950）`;

      case 'high_slow_queries':
        return `慢查询数量过多：${metrics.slowQueryCount}（阈值：50）`;

      case 'very_high_slow_queries':
        return `慢查询数量严重超标：${metrics.slowQueryCount}（阈值：200）`;

      case 'large_table_size':
        return `数据库表总大小过大：${this.formatBytes(metrics.tableSize)}（阈值：5GB）`;

      case 'very_large_table_size':
        return `数据库表总大小严重超标：${this.formatBytes(metrics.tableSize)}（阈值：10GB）`;

      case 'low_index_usage':
        return `索引使用率过低：${(metrics.indexUsage * 100).toFixed(1)}%（阈值：60%）`;

      case 'high_lock_wait':
        return `锁等待时间过长：${metrics.lockWaitTime}ms（阈值：10秒）`;

      case 'low_buffer_pool_hit':
        return `缓冲池命中率过低：${(metrics.bufferPoolUsage * 100).toFixed(1)}%（阈值：80%）`;

      case 'backup_failed':
        return '数据库备份任务失败';

      case 'no_recent_backup':
        return '超过24小时没有成功备份';

      case 'connection_lost':
        return '数据库连接中断';

      default:
        return rule.description;
    }
  }

  /**
   * 发送通知
   */
  private sendNotification(alert: Alert) {
    const notificationConfig = {
      slack: this.configService.get('SLACK_WEBHOOK_URL'),
      email: this.configService.get('ALERT_EMAIL'),
      webhook: this.configService.get('ALERT_WEBHOOK_URL'),
    };

    // 根据严重程度决定通知方式
    const notificationMethods = [];

    if (alert.severity === 'critical') {
      notificationMethods.push('slack', 'email', 'webhook');
    } else if (alert.severity === 'warning') {
      notificationMethods.push('slack', 'email');
    } else {
      notificationMethods.push('slack');
    }

    // 实际项目中应该实现具体的通知逻辑
    this.logger.log(`Would send ${alert.severity} alert via: ${notificationMethods.join(', ')}`);
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);

    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();

      this.activeAlerts.set(alertId, alert);

      this.eventEmitter.emit('alert.acknowledged', alert);

      return true;
    }

    return false;
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(hours: number = 24): Alert[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.timestamp >= cutoffTime)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 清理旧的告警记录
   */
  cleanupOldAlerts(daysToKeep: number = 7) {
    const cutoffTime = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    for (const [alertId, alert] of this.activeAlerts) {
      if (alert.timestamp < cutoffTime) {
        this.activeAlerts.delete(alertId);
      }
    }
  }

  /**
   * 获取所有规则
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 启用/禁用规则
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.get(ruleId);

    if (rule) {
      rule.enabled = enabled;
      this.rules.set(ruleId, rule);
      return true;
    }

    return false;
  }

  /**
   * 格式化字节大小
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
