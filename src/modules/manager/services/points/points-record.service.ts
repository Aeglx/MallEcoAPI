import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import {
  PointsRecord,
  PointsRecordType,
  PointsRecordSource,
} from '../../../framework/entities/points-record.entity';

@Injectable()
export class PointsRecordService {
  constructor(
    @InjectRepository(PointsRecord)
    private readonly pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  /**
   * 获取积分记录列表
   */
  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 10,
      memberId,
      memberUsername,
      type,
      source,
      orderNo,
      startTime,
      endTime,
    } = query;

    const skip = (Number(page) - 1) * Number(pageSize);

    const queryBuilder = this.pointsRecordRepository.createQueryBuilder('record');

    if (memberId) {
      queryBuilder.andWhere('record.memberId = :memberId', { memberId });
    }
    if (memberUsername) {
      queryBuilder.andWhere('record.memberUsername LIKE :memberUsername', {
        memberUsername: `%${memberUsername}%`,
      });
    }
    if (type) {
      queryBuilder.andWhere('record.type = :type', { type });
    }
    if (source) {
      queryBuilder.andWhere('record.source = :source', { source });
    }
    if (orderNo) {
      queryBuilder.andWhere('record.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    }
    if (startTime && endTime) {
      queryBuilder.andWhere('record.createTime >= :startTime', { startTime: new Date(startTime) });
      queryBuilder.andWhere('record.createTime <= :endTime', { endTime: new Date(endTime) });
    }

    try {
      const [result, total] = await queryBuilder
        .skip(skip)
        .take(Number(pageSize))
        .orderBy('record.createTime', 'DESC')
        .getManyAndCount();

      return {
        success: true,
        result,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        message: '获取积分记录列表成功',
      };
    } catch (error) {
      console.error('获取积分记录列表失败:', error);
      return {
        success: false,
        result: [],
        total: 0,
        message: '获取积分记录列表失败: ' + error.message,
      };
    }
  }

  /**
   * 获取会员积分记录
   */
  async findByMemberId(memberId: string, query: any) {
    const { page = 1, pageSize = 10, type, source } = query;

    const skip = (Number(page) - 1) * Number(pageSize);

    const queryBuilder = this.pointsRecordRepository.createQueryBuilder('record');
    queryBuilder.andWhere('record.memberId = :memberId', { memberId });

    if (type) {
      queryBuilder.andWhere('record.type = :type', { type });
    }
    if (source) {
      queryBuilder.andWhere('record.source = :source', { source });
    }

    try {
      const [result, total] = await queryBuilder
        .skip(skip)
        .take(Number(pageSize))
        .orderBy('record.createTime', 'DESC')
        .getManyAndCount();

      return {
        success: true,
        result,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        message: '获取积分记录成功',
      };
    } catch (error) {
      console.error('获取积分记录失败:', error);
      return {
        success: false,
        result: [],
        total: 0,
        message: '获取积分记录失败: ' + error.message,
      };
    }
  }

  /**
   * 调整会员积分（管理员操作）
   */
  async adjustPoints(adjustData: any) {
    try {
      const { memberId, points, remark, operatorId, operatorName } = adjustData;

      if (!memberId) {
        return {
          success: false,
          message: '会员ID不能为空',
        };
      }

      if (!points || points === 0) {
        return {
          success: false,
          message: '调整积分不能为0',
        };
      }

      // 这里需要注入Member服务或Repository来更新会员积分
      // 暂时返回成功，实际需要在调用方处理会员积分更新

      const record = this.pointsRecordRepository.create({
        memberId,
        type: points > 0 ? PointsRecordType.EARN : PointsRecordType.CONSUME,
        points,
        source: PointsRecordSource.ADMIN,
        remark: remark || '管理员调整积分',
        operatorId,
        operatorName,
      });

      await this.pointsRecordRepository.save(record);

      return {
        success: true,
        result: record,
        message: '调整积分成功',
      };
    } catch (error) {
      console.error('调整积分失败:', error);
      return {
        success: false,
        message: '调整积分失败: ' + error.message,
      };
    }
  }
}
