import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { DistributionCash } from '../entities/distribution-cash.entity';
import { DistributionCashStatusEnum } from '../entities/distribution-cash.entity';

@Injectable()
export class DistributionCashService {
  constructor(
    @InjectRepository(DistributionCash)
    private distributionCashRepository: Repository<DistributionCash>,
  ) {}

  /**
   * 申请提现
   */
  async applyCash(cashData: Partial<DistributionCash>): Promise<DistributionCash> {
    // 生成提现流水号
    const cashSerialNo = this.generateCashSerialNo();
    
    const distributionCash = new DistributionCash();
    Object.assign(distributionCash, cashData);
    distributionCash.cashSerialNo = cashSerialNo;
    distributionCash.cashStatus = DistributionCashStatusEnum.PENDING;

    return await this.distributionCashRepository.save(distributionCash);
  }

  /**
   * 审核提现申请
   */
  async auditCash(
    id: string, 
    status: DistributionCashStatusEnum, 
    auditRemark?: string,
    auditBy?: string
  ): Promise<DistributionCash> {
    const distributionCash = await this.distributionCashRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionCash) {
      throw new NotFoundException('提现申请不存在');
    }

    if (distributionCash.cashStatus !== DistributionCashStatusEnum.PENDING) {
      throw new BadRequestException('只能审核待审核状态的申请');
    }

    distributionCash.cashStatus = status;
    distributionCash.auditRemark = auditRemark;
    distributionCash.auditBy = auditBy;
    distributionCash.auditTime = new Date();

    return await this.distributionCashRepository.save(distributionCash);
  }

  /**
   * 获取提现申请详情
   */
  async getCashById(id: string): Promise<DistributionCash> {
    const distributionCash = await this.distributionCashRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionCash) {
      throw new NotFoundException('提现申请不存在');
    }

    return distributionCash;
  }

  /**
   * 获取分销员的提现记录
   */
  async getCashByDistributionId(distributionId: string): Promise<DistributionCash[]> {
    return await this.distributionCashRepository.find({
      where: { distributionId, deleteFlag: false },
      order: { createTime: 'DESC' }
    });
  }

  /**
   * 分页查询提现记录
   */
  async getCashList(
    distributionId?: string,
    cashStatus?: DistributionCashStatusEnum,
    startTime?: string,
    endTime?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ items: DistributionCash[], total: number }> {
    const queryBuilder = this.distributionCashRepository
      .createQueryBuilder('distributionCash')
      .where('distributionCash.deleteFlag = :deleteFlag', { deleteFlag: false });

    if (distributionId) {
      queryBuilder.andWhere('distributionCash.distributionId = :distributionId', { distributionId });
    }

    if (cashStatus) {
      queryBuilder.andWhere('distributionCash.cashStatus = :cashStatus', { cashStatus });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('distributionCash.createTime BETWEEN :startTime AND :endTime', { 
        startTime, 
        endTime 
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('distributionCash.createTime', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 生成提现流水号
   */
  private generateCashSerialNo(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASH${timestamp}${random}`;
  }

  /**
   * 获取提现统计信息
   */
  async getCashStatistics(distributionId?: string): Promise<any> {
    let whereCondition = { deleteFlag: false };
    if (distributionId) {
      whereCondition['distributionId'] = distributionId;
    }

    const totalCount = await this.distributionCashRepository.count({
      where: whereCondition
    });

    const pendingCount = await this.distributionCashRepository.count({
      where: { 
        ...whereCondition,
        cashStatus: DistributionCashStatusEnum.PENDING 
      }
    });

    const approvedCount = await this.distributionCashRepository.count({
      where: { 
        ...whereCondition,
        cashStatus: DistributionCashStatusEnum.APPROVED 
      }
    });

    const completedCount = await this.distributionCashRepository.count({
      where: { 
        ...whereCondition,
        cashStatus: DistributionCashStatusEnum.COMPLETED 
      }
    });

    // 计算总提现金额
    const result = await this.distributionCashRepository
      .createQueryBuilder('distributionCash')
      .select('SUM(distributionCash.cashAmount)', 'totalCashAmount')
      .where(whereCondition)
      .andWhere('distributionCash.cashStatus IN (:...statuses)', { 
        statuses: [DistributionCashStatusEnum.APPROVED, DistributionCashStatusEnum.COMPLETED] 
      })
      .getRawOne();

    const totalCashAmount = parseFloat(result.totalCashAmount) || 0;

    return {
      totalCount,
      pendingCount,
      approvedCount,
      completedCount,
      totalCashAmount
    };
  }
}