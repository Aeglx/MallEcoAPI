import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatistics } from '../entities/user-statistics.entity';
import { UserStatisticsQueryDto } from '../dto/user-statistics-query.dto';

@Injectable()
export class UserStatisticsService {
  constructor(
    @InjectRepository(UserStatistics)
    private userStatisticsRepository: Repository<UserStatistics>,
  ) {}

  async getUserStatistics(queryDto: UserStatisticsQueryDto) {
    const { startDate, endDate, userType, source, granularity = 'daily' } = queryDto;
    
    const queryBuilder = this.userStatisticsRepository
      .createQueryBuilder('user')
      .where('user.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('user.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType });
    }

    if (source) {
      queryBuilder.andWhere('user.source = :source', { source });
    }

    return await queryBuilder
      .orderBy('user.statDate', 'ASC')
      .getMany();
  }

  async getUserGrowth(queryDto: UserStatisticsQueryDto) {
    const { startDate, endDate, userType } = queryDto;
    
    const queryBuilder = this.userStatisticsRepository
      .createQueryBuilder('user')
      .select([
        'user.statDate',
        'SUM(user.newUsers) as newUsers',
        'SUM(user.activeUsers) as activeUsers',
        'SUM(user.totalUsers) as totalUsers',
        'AVG(user.retentionRate) as avgRetentionRate'
      ]);

    if (startDate && endDate) {
      queryBuilder.andWhere('user.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType });
    }

    return await queryBuilder
      .groupBy('user.statDate')
      .orderBy('user.statDate', 'ASC')
      .getRawMany();
  }

  async getUserRetention(queryDto: UserStatisticsQueryDto) {
    const { startDate, endDate, userType } = queryDto;
    
    const queryBuilder = this.userStatisticsRepository
      .createQueryBuilder('user')
      .select([
        'user.statDate',
        'AVG(user.retentionRate) as retentionRate',
        'AVG(user.churnRate) as churnRate',
        'SUM(user.churnedUsers) as churnedUsers'
      ]);

    if (startDate && endDate) {
      queryBuilder.andWhere('user.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType });
    }

    return await queryBuilder
      .groupBy('user.statDate')
      .orderBy('user.statDate', 'ASC')
      .getRawMany();
  }

  async getUserBehavior(queryDto: UserStatisticsQueryDto) {
    const { startDate, endDate, userType } = queryDto;
    
    const queryBuilder = this.userStatisticsRepository
      .createQueryBuilder('user')
      .select([
        'user.statDate',
        'AVG(user.avgOnlineTime) as avgOnlineTime',
        'SUM(user.loginUsers) as loginUsers'
      ]);

    if (startDate && endDate) {
      queryBuilder.andWhere('user.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType });
    }

    return await queryBuilder
      .groupBy('user.statDate')
      .orderBy('user.statDate', 'ASC')
      .getRawMany();
  }

  async generateUserReport(queryDto: UserStatisticsQueryDto) {
    const statistics = await this.getUserStatistics(queryDto);
    const userGrowth = await this.getUserGrowth(queryDto);
    const userRetention = await this.getUserRetention(queryDto);
    const userBehavior = await this.getUserBehavior(queryDto);

    return {
      summary: {
        totalNewUsers: statistics.reduce((sum, item) => sum + item.newUsers, 0),
        totalActiveUsers: statistics.reduce((sum, item) => sum + item.activeUsers, 0),
        avgRetentionRate: statistics.length > 0 ? 
          statistics.reduce((sum, item) => sum + item.retentionRate, 0) / statistics.length : 0,
        avgOnlineTime: statistics.length > 0 ? 
          statistics.reduce((sum, item) => sum + item.avgOnlineTime, 0) / statistics.length : 0,
      },
      userGrowth,
      userRetention,
      userBehavior,
      detailedStatistics: statistics,
    };
  }
}