import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThan, MoreThan } from 'typeorm';
import { SystemLogEntity } from '../entities/system-log.entity';
import { SystemLogSearchDto } from '../dto/system-log-search.dto';

@Injectable()
export class SystemLogService {
  constructor(
    @InjectRepository(SystemLogEntity)
    private readonly logRepository: Repository<SystemLogEntity>,
  ) {}

  /**
   * 记录系统日志
   */
  async log(logData: Partial<SystemLogEntity>): Promise<SystemLogEntity> {
    const log = this.logRepository.create(logData);
    return await this.logRepository.save(log);
  }

  /**
   * 查询系统日志列表
   */
  async findAll(searchDto: SystemLogSearchDto): Promise<{
    list: SystemLogEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { 
      logType, 
      level, 
      module, 
      username, 
      userId, 
      startTime, 
      endTime, 
      keyword,
      page, 
      limit, 
      orderBy, 
      order 
    } = searchDto;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (logType) {
      where.logType = logType;
    }

    if (level) {
      where.level = level;
    }

    if (module) {
      where.module = Like(`%${module}%`);
    }

    if (username) {
      where.username = Like(`%${username}%`);
    }

    if (userId) {
      where.userId = userId;
    }

    if (startTime && endTime) {
      where.createdAt = Between(startTime, endTime);
    } else if (startTime) {
      where.createdAt = MoreThan(startTime);
    } else if (endTime) {
      where.createdAt = LessThan(endTime);
    }

    // 关键词搜索
    if (keyword) {
      where.description = Like(`%${keyword}%`);
    }

    const [list, total] = await this.logRepository.findAndCount({
      where,
      order: { [orderBy]: order },
      skip,
      take: limit
    });

    return {
      list,
      total,
      page,
      limit
    };
  }

  /**
   * 根据ID查询日志
   */
  async findOne(id: number): Promise<SystemLogEntity> {
    return await this.logRepository.findOne({ where: { id } });
  }

  /**
   * 删除日志
   */
  async remove(id: number): Promise<void> {
    await this.logRepository.delete(id);
  }

  /**
   * 批量删除日志
   */
  async removeBatch(ids: number[]): Promise<void> {
    await this.logRepository.delete(ids);
  }

  /**
   * 清理过期日志
   */
  async cleanExpiredLogs(keepDays: number = 30): Promise<number> {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - keepDays);

    const result = await this.logRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :expireDate', { expireDate })
      .execute();

    return result.affected;
  }

  /**
   * 获取日志统计信息
   */
  async getLogStatistics(days: number = 7): Promise<{
    totalCount: number;
    errorCount: number;
    warningCount: number;
    dailyStats: Array<{ date: string; count: number; errorCount: number }>;
    levelStats: Array<{ level: string; count: number }>;
    moduleStats: Array<{ module: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 总数量统计
    const totalCount = await this.logRepository.count({
      where: { createdAt: MoreThan(startDate) }
    });

    // 错误和警告数量统计
    const errorCount = await this.logRepository.count({
      where: { level: 'error', createdAt: MoreThan(startDate) }
    });

    const warningCount = await this.logRepository.count({
      where: { level: 'warn', createdAt: MoreThan(startDate) }
    });

    // 每日统计
    const dailyStats = await this.logRepository
      .createQueryBuilder('log')
      .select('DATE(log.createdAt) as date')
      .addSelect('COUNT(*) as count')
      .addSelect('SUM(CASE WHEN log.level = \'error\' THEN 1 ELSE 0 END) as errorCount')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 日志级别统计
    const levelStats = await this.logRepository
      .createQueryBuilder('log')
      .select('log.level as level')
      .addSelect('COUNT(*) as count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.level')
      .orderBy('count', 'DESC')
      .getRawMany();

    // 模块统计
    const moduleStats = await this.logRepository
      .createQueryBuilder('log')
      .select('log.module as module')
      .addSelect('COUNT(*) as count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.module')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalCount,
      errorCount,
      warningCount,
      dailyStats: dailyStats.map(item => ({
        date: item.date,
        count: parseInt(item.count),
        errorCount: parseInt(item.errorCount)
      })),
      levelStats: levelStats.map(item => ({
        level: item.level,
        count: parseInt(item.count)
      })),
      moduleStats: moduleStats.map(item => ({
        module: item.module,
        count: parseInt(item.count)
      }))
    };
  }

  /**
   * 获取日志类型列表
   */
  async getLogTypes(): Promise<string[]> {
    const types = await this.logRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.logType', 'logType')
      .orderBy('log.logType', 'ASC')
      .getRawMany();

    return types.map(item => item.logType);
  }

  /**
   * 获取模块列表
   */
  async getModules(): Promise<string[]> {
    const modules = await this.logRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.module', 'module')
      .orderBy('log.module', 'ASC')
      .getRawMany();

    return modules.map(item => item.module);
  }
}