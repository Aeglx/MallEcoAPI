import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Log, LogType, LogOperationType, LogResult } from './entities/log.entity';
import { CreateLogDto, QueryLogDto } from './dto/create-log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<Log> {
    const log = this.logRepository.create(createLogDto);
    return await this.logRepository.save(log);
  }

  async findAll(queryDto: QueryLogDto): Promise<{ data: Log[]; total: number }> {
    const { page = 1, limit = 10, logType, operationType, operatorId, operatorName, startTime, endTime } = queryDto;

    const query = this.logRepository.createQueryBuilder('log');

    if (logType) query.andWhere('log.logType = :logType', { logType });
    if (operationType) query.andWhere('log.operationType = :operationType', { operationType });
    if (operatorId) query.andWhere('log.operatorId = :operatorId', { operatorId });
    if (operatorName) query.andWhere('log.operatorName LIKE :operatorName', { operatorName: `%${operatorName}%` });
    if (startTime) query.andWhere('log.operationTime >= :startTime', { startTime });
    if (endTime) query.andWhere('log.operationTime <= :endTime', { endTime });

    query.orderBy('log.operationTime', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Log> {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Log with id ${id} not found`);
    }
    return log;
  }

  async remove(id: string): Promise<void> {
    const result = await this.logRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Log with id ${id} not found`);
    }
  }

  async removeByDateRange(startTime: Date, endTime: Date): Promise<{ deletedCount: number }> {
    const result = await this.logRepository.delete({
      operationTime: Between(startTime, endTime),
    });
    return { deletedCount: result.affected || 0 };
  }

  async removeOldLogs(daysToKeep: number): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.logRepository.delete({
      operationTime: LessThanOrEqual(cutoffDate),
    });
    return { deletedCount: result.affected || 0 };
  }

  async getLogStatistics(startTime: Date, endTime: Date): Promise<any> {
    // 按日志类型统计
    const typeStats = await this.logRepository
      .createQueryBuilder('log')
      .select('log.logType, COUNT(*) as count')
      .where('log.operationTime BETWEEN :startTime AND :endTime', { startTime, endTime })
      .groupBy('log.logType')
      .getRawMany();

    // 按操作结果统计
    const resultStats = await this.logRepository
      .createQueryBuilder('log')
      .select('log.result, COUNT(*) as count')
      .where('log.operationTime BETWEEN :startTime AND :endTime', { startTime, endTime })
      .groupBy('log.result')
      .getRawMany();

    // 按日期统计
    const dateStats = await this.logRepository
      .createQueryBuilder('log')
      .select('DATE(log.operationTime) as date, COUNT(*) as count')
      .where('log.operationTime BETWEEN :startTime AND :endTime', { startTime, endTime })
      .groupBy('DATE(log.operationTime)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 按小时统计（24小时分布）
    const hourStats = await this.logRepository
      .createQueryBuilder('log')
      .select('HOUR(log.operationTime) as hour, COUNT(*) as count')
      .where('log.operationTime BETWEEN :startTime AND :endTime', { startTime, endTime })
      .groupBy('HOUR(log.operationTime)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    // 错误日志统计（最近24小时）
    const recentErrorStats = await this.logRepository
      .createQueryBuilder('log')
      .select('DATE(log.operationTime) as date, HOUR(log.operationTime) as hour, COUNT(*) as count')
      .where('log.operationTime >= :twentyFourHoursAgo', { twentyFourHoursAgo: MoreThanOrEqual(new Date(Date.now() - 24 * 60 * 60 * 1000)) })
      .andWhere('log.result = :result', { result: LogResult.FAILED })
      .groupBy('DATE(log.operationTime), HOUR(log.operationTime)')
      .orderBy('date, hour', 'ASC')
      .getRawMany();

    // 热门接口统计
    const popularApiStats = await this.logRepository
      .createQueryBuilder('log')
      .select('log.requestUrl, log.requestMethod, COUNT(*) as count')
      .where('log.operationTime BETWEEN :startTime AND :endTime', { startTime, endTime })
      .groupBy('log.requestUrl, log.requestMethod')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 总统计
    const totalStats = await this.logRepository
      .createQueryBuilder('log')
      .select(
        'COUNT(*) as total, ' +
        'SUM(CASE WHEN log.result = :success THEN 1 ELSE 0 END) as successCount, ' +
        'SUM(CASE WHEN log.result = :failed THEN 1 ELSE 0 END) as failedCount'
      )
      .where('log.operationTime BETWEEN :startTime AND :endTime', { startTime, endTime })
      .setParameter('success', LogResult.SUCCESS)
      .setParameter('failed', LogResult.FAILED)
      .getRawOne();

    return {
      totalStats,
      typeStats,
      resultStats,
      dateStats,
      hourStats,
      recentErrorStats,
      popularApiStats,
    };
  }

  // 批量创建日志
  async createBatch(logs: CreateLogDto[]): Promise<Log[]> {
    const logEntities = this.logRepository.create(logs);
    return await this.logRepository.save(logEntities);
  }

  // 统计指定用户的操作日志
  async getUserOperationStats(operatorId: string, days: number = 30): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // 用户操作类型统计
    const operationStats = await this.logRepository
      .createQueryBuilder('log')
      .select('log.operationType, COUNT(*) as count')
      .where('log.operatorId = :operatorId', { operatorId })
      .andWhere('log.operationTime >= :cutoffDate', { cutoffDate })
      .groupBy('log.operationType')
      .orderBy('count', 'DESC')
      .getRawMany();

    // 用户操作趋势
    const trendStats = await this.logRepository
      .createQueryBuilder('log')
      .select('DATE(log.operationTime) as date, COUNT(*) as count')
      .where('log.operatorId = :operatorId', { operatorId })
      .andWhere('log.operationTime >= :cutoffDate', { cutoffDate })
      .groupBy('DATE(log.operationTime)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      operationStats,
      trendStats,
    };
  }
}
