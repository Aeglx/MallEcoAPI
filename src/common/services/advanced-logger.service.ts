import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context?: string;
  traceId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  duration?: number;
  error?: Error;
}

interface LogConfig {
  level: string;
  format: 'json' | 'text';
  enablePerformanceLogging: boolean;
  enableAuditLogging: boolean;
  maxLogSize: number;
  retentionDays: number;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AdvancedLoggerService {
  private readonly config: LogConfig;
  private readonly logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 100;
  private context?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.config = {
      level: this.configService.get('LOG_LEVEL') || 'info',
      format: this.configService.get('LOG_FORMAT') || 'json',
      enablePerformanceLogging: this.configService.get('LOG_PERFORMANCE_ENABLED') === 'true',
      enableAuditLogging: this.configService.get('LOG_AUDIT_ENABLED') === 'true',
      maxLogSize: parseInt(this.configService.get('LOG_MAX_SIZE') || '10485760'), // 10MB
      retentionDays: parseInt(this.configService.get('LOG_RETENTION_DAYS') || '30'),
    };
  }

  /**
   * 设置日志上下文
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * 记录调试日志
   */
  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, metadata);
    }
  }

  /**
   * 记录信息日志
   */
  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.log('info', message, metadata);
    }
  }

  /**
   * 记录警告日志
   */
  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, metadata);
    }
  }

  /**
   * 记录错误日志
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.log('error', message, { ...metadata, error });
    }
  }

  /**
   * 记录严重错误日志
   */
  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (this.shouldLog('fatal')) {
      this.log('fatal', message, { ...metadata, error });
    }
  }

  /**
   * 记录性能日志
   */
  performance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    if (this.config.enablePerformanceLogging && this.shouldLog('info')) {
      this.log('info', `Performance: ${operation}`, {
        ...metadata,
        duration,
        operation,
      });
    }
  }

  /**
   * 记录审计日志
   */
  audit(
    action: string,
    resource: string,
    userId: string,
    metadata?: Record<string, any>,
  ): void {
    if (this.config.enableAuditLogging && this.shouldLog('info')) {
      this.log('info', `Audit: ${action}`, {
        ...metadata,
        action,
        resource,
        userId,
        audit: true,
      });
    }
  }

  /**
   * 创建带计时器的日志记录器
   */
  createTimer(operation: string): Timer {
    const startTime = Date.now();
    
    return {
      stop: (metadata?: Record<string, any>) => {
        const duration = Date.now() - startTime;
        this.performance(operation, duration, metadata);
        return duration;
      },
    };
  }

  /**
   * 获取日志统计信息
   */
  getLogStats(): {
    totalLogs: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
  } {
    const byLevel: Record<string, number> = {};
    const byContext: Record<string, number> = {};

    this.logBuffer.forEach(entry => {
      byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
      
      const context = entry.context || 'unknown';
      byContext[context] = (byContext[context] || 0) + 1;
    });

    return {
      totalLogs: this.logBuffer.length,
      byLevel,
      byContext,
    };
  }

  /**
   * 导出日志数据
   */
  exportLogs(
    level?: string,
    startTime?: number,
    endTime?: number,
  ): LogEntry[] {
    return this.logBuffer.filter(entry => {
      let match = true;
      
      if (level && entry.level !== level) {
        match = false;
      }
      
      if (startTime && entry.timestamp < startTime) {
        match = false;
      }
      
      if (endTime && entry.timestamp > endTime) {
        match = false;
      }
      
      return match;
    });
  }

  /**
   * 清理日志缓冲区
   */
  cleanupLogs(retentionHours: number = 24): void {
    const cutoffTime = Date.now() - retentionHours * 60 * 60 * 1000;
    const initialLength = this.logBuffer.length;
    
    this.logBuffer = this.logBuffer.filter(entry => entry.timestamp >= cutoffTime);
    
    const removedCount = initialLength - this.logBuffer.length;
    if (removedCount > 0) {
      this.info(`Cleaned up ${removedCount} old log entries`);
    }
  }

  /**
   * 内部日志记录方法
   */
  private log(
    level: LogEntry['level'],
    message: string,
    metadata?: Record<string, any>,
  ): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.context,
      metadata,
    };

    // 添加到缓冲区
    this.logBuffer.push(logEntry);
    
    // 保持缓冲区大小
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // 格式化并输出日志
    this.outputLog(logEntry);

    // 发出日志事件
    this.eventEmitter.emit('log.recorded', logEntry);
  }

  /**
   * 输出日志
   */
  private outputLog(entry: LogEntry): void {
    const formattedLog = this.formatLog(entry);
    
    switch (entry.level) {
      case 'debug':
        console.debug(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
      case 'fatal':
        console.error(formattedLog);
        break;
    }
  }

  /**
   * 格式化日志
   */
  private formatLog(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify({
        timestamp: new Date(entry.timestamp).toISOString(),
        level: entry.level.toUpperCase(),
        message: entry.message,
        context: entry.context,
        ...entry.metadata,
      });
    } else {
      // 文本格式
      const timestamp = new Date(entry.timestamp).toISOString();
      const level = entry.level.toUpperCase().padEnd(5);
      const context = entry.context ? `[${entry.context}]` : '';
      const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      
      return `${timestamp} ${level} ${context} ${entry.message}${metadata}`;
    }
  }

  /**
   * 检查是否应该记录该级别的日志
   */
  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }
}

interface Timer {
  stop: (metadata?: Record<string, any>) => number;
}

// 全局日志配置常量
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

export const LOG_FORMATS = {
  JSON: 'json',
  TEXT: 'text',
} as const;