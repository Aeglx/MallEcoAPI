import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as Elasticsearch from 'winston-elasticsearch';

interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  module?: string;
  method?: string;
  [key: string]: any;
}

@Injectable()
export class AdvancedLoggerService implements OnModuleInit {
  private logger: winston.Logger;
  private readonly LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  };

  constructor(private configService: ConfigService) {
    this.initLogger();
  }

  async onModuleInit() {
    console.log('Advanced logger service initialized');
  }

  private initLogger() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const logLevel = this.configService.get('LOG_LEVEL') || 'info';

    // 定义日志格式
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      }),
    );

    // 创建logger实例
    this.logger = winston.createLogger({
      level: logLevel,
      levels: this.LOG_LEVELS,
      format: logFormat,
      defaultMeta: {
        service: 'mall-eco-api',
        version: '1.0.0',
      },
      transports: [
        // 控制台输出（开发环境）
        new winston.transports.Console({
          format: consoleFormat,
          level: isProduction ? 'warn' : 'debug',
        }),

        // 每日轮转文件（生产环境）
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'info',
        }),

        // 错误日志单独文件
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '90d',
          level: 'error',
        }),

        // HTTP请求日志
        new winston.transports.DailyRotateFile({
          filename: 'logs/http-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'http',
        }),
      ],
    });

    // Elasticsearch集成（如果配置了ES）
    const esHost = this.configService.get('ELASTICSEARCH_HOST');
    if (esHost && isProduction) {
      const esTransport = new Elasticsearch.ElasticsearchTransport({
        level: 'info',
        clientOpts: {
          node: esHost,
          auth: {
            username: this.configService.get('ELASTICSEARCH_USERNAME') || '',
            password: this.configService.get('ELASTICSEARCH_PASSWORD') || '',
          },
        },
        indexPrefix: 'mall-eco-logs',
      });

      this.logger.add(esTransport);
    }

    // 处理未捕获的异常
    this.logger.exceptions.handle(new winston.transports.File({ filename: 'logs/exceptions.log' }));

    // 处理未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection:', {
        reason,
        promise,
        stack: new Error().stack,
      });
    });
  }

  // ==================== 基础日志方法 ====================

  error(message: string, context?: LogContext) {
    this.logger.error(message, context);
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context);
  }

  http(message: string, context?: LogContext) {
    this.logger.http(message, context);
  }

  verbose(message: string, context?: LogContext) {
    this.logger.verbose(message, context);
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }

  // ==================== 业务日志方法 ====================

  /**
   * 记录用户操作日志
   */
  userAction(userId: string, action: string, resource: string, details?: any, ip?: string) {
    this.info(`User action: ${action}`, {
      userId,
      action,
      resource,
      details,
      ip,
      module: 'user',
      type: 'action',
    });
  }

  /**
   * 记录订单相关日志
   */
  orderLog(orderId: string, action: string, details?: any, userId?: string) {
    this.info(`Order ${action}: ${orderId}`, {
      orderId,
      action,
      details,
      userId,
      module: 'order',
      type: 'business',
    });
  }

  /**
   * 记录支付相关日志
   */
  paymentLog(paymentId: string, action: string, amount?: number, details?: any) {
    this.info(`Payment ${action}: ${paymentId}`, {
      paymentId,
      action,
      amount,
      details,
      module: 'payment',
      type: 'business',
    });
  }

  /**
   * 记录安全相关日志
   */
  securityLog(event: string, level: 'info' | 'warn' | 'error', details?: any, ip?: string) {
    this[level](`Security event: ${event}`, {
      event,
      details,
      ip,
      module: 'security',
      type: 'security',
    });
  }

  /**
   * 记录性能日志
   */
  performanceLog(operation: string, duration: number, details?: any) {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      details,
      module: 'performance',
      type: 'performance',
    });
  }

  // ==================== 审计日志方法 ====================

  /**
   * 记录敏感操作审计日志
   */
  auditLog(
    userId: string,
    action: string,
    resource: string,
    beforeState?: any,
    afterState?: any,
    ip?: string,
  ) {
    this.info(`Audit: ${action} on ${resource}`, {
      userId,
      action,
      resource,
      beforeState,
      afterState,
      ip,
      module: 'audit',
      type: 'audit',
    });
  }

  /**
   * 记录数据变更审计日志
   */
  dataChangeLog(
    userId: string,
    table: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    oldData?: any,
    newData?: any,
  ) {
    this.info(`Data ${operation}: ${table}.${recordId}`, {
      userId,
      table,
      recordId,
      operation,
      oldData,
      newData,
      module: 'data',
      type: 'audit',
    });
  }

  // ==================== 工具方法 ====================

  /**
   * 生成请求ID
   */
  generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建日志上下文
   */
  createContext(baseContext?: LogContext): LogContext {
    return {
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      ...baseContext,
    };
  }

  /**
   * 获取日志统计信息
   */
  async getLogStats(): Promise<{
    totalLogs: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    lastHourStats: any;
  }> {
    // 这里可以实现日志统计逻辑
    // 可以查询Elasticsearch或分析日志文件
    return {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      lastHourStats: {},
    };
  }

  /**
   * 日志搜索
   */
  async searchLogs(
    query: string,
    level?: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 100,
  ): Promise<any[]> {
    // 这里可以实现日志搜索逻辑
    // 可以集成Elasticsearch的搜索功能
    return [];
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: string;
    message?: string;
    details?: any;
  }> {
    try {
      // 检查日志文件是否可写
      // 检查Elasticsearch连接（如果启用）

      return {
        status: 'healthy',
        details: {
          transports: this.logger.transports.length,
          level: this.logger.level,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        details: { error: error.message },
      };
    }
  }

  /**
   * 清理旧日志
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<{
    deletedFiles: number;
    totalSize: number;
  }> {
    // 这里可以实现日志清理逻辑
    return {
      deletedFiles: 0,
      totalSize: 0,
    };
  }
}
