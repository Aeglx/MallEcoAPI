import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SystemLogEntity } from '../entities/system-log.entity';

export interface AuditLogData {
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export interface LogSearchOptions {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  level?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(SystemLogEntity)
    private readonly systemLogRepository: Repository<SystemLogEntity>,
  ) {}

  /**
   * 记录审计日志
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      const logEntry = this.systemLogRepository.create({
        userId: data.userId,
        username: data.username,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details ? JSON.stringify(data.details) : null,
        ip: data.ip,
        userAgent: data.userAgent,
        level: data.level || 'info',
        timestamp: new Date(),
      });

      await this.systemLogRepository.save(logEntry);

      // 同时记录到标准日志
      this.logger.log(
        `AUDIT: ${data.action} on ${data.resource} by user ${data.username || data.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to save audit log:', error);
      // 不抛出错误，避免影响主要业务流程
    }
  }

  /**
   * 记录用户登录
   */
  async logUserLogin(userId: string, username: string, ip: string, userAgent: string): Promise<void> {
    await this.log({
      userId,
      username,
      action: 'LOGIN',
      resource: 'AUTH',
      details: { loginTime: new Date() },
      ip,
      userAgent,
      level: 'info',
    });
  }

  /**
   * 记录用户登出
   */
  async logUserLogout(userId: string, username: string, ip: string): Promise<void> {
    await this.log({
      userId,
      username,
      action: 'LOGOUT',
      resource: 'AUTH',
      details: { logoutTime: new Date() },
      ip,
      level: 'info',
    });
  }

  /**
   * 记录资源访问
   */
  async logResourceAccess(
    userId: string,
    username: string,
    resource: string,
    resourceId: string,
    action: string,
    ip: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action,
      resource,
      resourceId,
      ip,
      userAgent,
      level: 'info',
    });
  }

  /**
   * 记录资源修改
   */
  async logResourceModification(
    userId: string,
    username: string,
    resource: string,
    resourceId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    oldValue?: any,
    newValue?: any,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action,
      resource,
      resourceId,
      details: {
        oldValue,
        newValue,
        modificationTime: new Date(),
      },
      ip,
      userAgent,
      level: 'warn',
    });
  }

  /**
   * 记录安全事件
   */
  async logSecurityEvent(
    event: string,
    details: any,
    userId?: string,
    username?: string,
    ip?: string,
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action: event,
      resource: 'SECURITY',
      details,
      ip,
      level: 'error',
    });
  }

  /**
   * 记录系统错误
   */
  async logSystemError(
    error: Error,
    context?: any,
    userId?: string,
    username?: string,
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action: 'SYSTEM_ERROR',
      resource: 'SYSTEM',
      details: {
        errorMessage: error.message,
        stackTrace: error.stack,
        context,
        timestamp: new Date(),
      },
      level: 'error',
    });
  }

  /**
   * 搜索审计日志
   */
  async searchLogs(options: LogSearchOptions): Promise<{
    logs: SystemLogEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      level,
      page = 1,
      limit = 10,
    } = options;

    const queryBuilder = this.systemLogRepository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action LIKE :action', { action: `%${action}%` });
    }

    if (resource) {
      queryBuilder.andWhere('log.resource = :resource', { resource });
    }

    if (level) {
      queryBuilder.andWhere('log.level = :level', { level });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const total = await queryBuilder.getCount();

    const logs = await queryBuilder
      .orderBy('log.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取用户活动统计
   */
  async getUserActivityStats(userId: string, days: number = 30): Promise<{
    totalActions: number;
    actionsByType: { [key: string]: number };
    dailyActivity: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.systemLogRepository.find({
      where: {
        userId,
        timestamp: Between(startDate, new Date()),
      },
      order: { timestamp: 'ASC' },
    });

    const actionsByType: { [key: string]: number } = {};
    const dailyActivity: { [key: string]: number } = {};

    logs.forEach(log => {
      // 统计操作类型
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // 统计每日活动
      const date = log.timestamp.toISOString().substring(0, 10);
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return {
      totalActions: logs.length,
      actionsByType,
      dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  /**
   * 获取系统活动统计
   */
  async getSystemActivityStats(days: number = 7): Promise<{
    totalActions: number;
    uniqueUsers: number;
    actionsByResource: { [key: string]: number };
    errorRate: number;
    dailyActivity: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.systemLogRepository.find({
      where: {
        timestamp: Between(startDate, new Date()),
      },
    });

    const totalActions = logs.length;
    const uniqueUsers = new Set(logs.filter(log => log.userId).map(log => log.userId)).size;
    const actionsByResource: { [key: string]: number } = {};
    const errorsCount = logs.filter(log => log.level === 'error').length;
    const dailyActivity: { [key: string]: number } = {};

    logs.forEach(log => {
      actionsByResource[log.resource] = (actionsByResource[log.resource] || 0) + 1;

      const date = log.timestamp.toISOString().substring(0, 10);
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return {
      totalActions,
      uniqueUsers,
      actionsByResource,
      errorRate: totalActions > 0 ? (errorsCount / totalActions) * 100 : 0,
      dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  /**
   * 清理旧日志
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.systemLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old log entries`);
    return result.affected || 0;
  }
}