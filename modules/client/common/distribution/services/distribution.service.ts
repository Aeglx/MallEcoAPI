import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Distribution } from '../entities/distribution.entity';
import { Member } from '../../member/entities/member.entity';
import { CustomException } from '../../filters/custom-exception';
import { CodeEnum } from '../../enums/code.enum';

// 生成分销码
async function generateDistributionCode(): Promise<string> {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `D${timestamp}${randomStr}`.toUpperCase().substring(0, 16);
}

@Injectable()
export class DistributionService {
  constructor(
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 申请成为分销�?
   */
  async applyDistribution(memberId: string, parentId?: string): Promise<Distribution> {
    // 检查是否已经是分销�?
    const existing = await this.distributionRepository.findOne({
      where: { memberId },
    });
    if (existing) {
      throw new CustomException(CodeEnum.DISTRIBUTION_ALREADY_APPROVED);
    }

    // 检查是否存在待审核申请
    const pending = await this.distributionRepository.findOne({
      where: { memberId, status: 'pending' },
    });
    if (pending) {
      throw new CustomException(CodeEnum.DISTRIBUTION_APPLY_PENDING);
    }

    // 验证上级分销�?
    if (parentId) {
      const parent = await this.distributionRepository.findOne({
        where: { id: parentId, status: 'approved' },
      });
      if (!parent) {
        throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
      }
    }

    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new CustomException(CodeEnum.USER_NOT_FOUND);
    }

    return await this.dataSource.transaction(async manager => {
      // 创建分销员申�?
      const distribution = manager.create(Distribution, {
        memberId,
        parentId,
        distributionCode: await generateDistributionCode(),
        level: parentId ? 2 : 1, // 有上级就是二级分销员，否则是一�?
        status: 'pending',
        applyTime: new Date(),
      });

      const saved = await manager.save(distribution);

      // 更新上级统计
      if (parentId) {
        await manager.increment(Distribution, { id: parentId }, 'teamCount', 1);
        await manager.increment(Distribution, { id: parentId }, 'directCount', 1);
      }

      return saved;
    });
  }

  /**
   * 审核分销员申�?
   */
  async auditDistribution(
    id: string,
    auditUserId: string,
    status: 'approved' | 'rejected',
    remark?: string,
  ): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id },
    });
    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    if (distribution.status !== 'pending') {
      throw new CustomException(CodeEnum.DISTRIBUTION_ALREADY_AUDITED);
    }

    distribution.status = status;
    distribution.auditTime = new Date();
    distribution.auditUserId = auditUserId;
    distribution.auditRemark = remark;

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 获取分销员信�?
   */
  async getDistributionByMemberId(memberId: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { memberId },
      relations: ['member', 'parent'],
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    return distribution;
  }

  /**
   * 更新分销员统计信�?
   */
  async updateDistributionStats(distributionId: string, orderAmount: number): Promise<void> {
    await this.distributionRepository.increment(
      { id: distributionId },
      'totalOrderAmount',
      orderAmount,
    );
    await this.distributionRepository.increment(
      { id: distributionId },
      'monthOrderAmount',
      orderAmount,
    );
    await this.distributionRepository.increment(
      { id: distributionId },
      'totalOrderCount',
      1,
    );
    await this.distributionRepository.increment(
      { id: distributionId },
      'monthOrderCount',
      1,
    );
  }

  /**
   * 更新佣金统计
   */
  async updateCommissionStats(distributionId: string, commissionAmount: number): Promise<void> {
    await this.distributionRepository.increment(
      { id: distributionId },
      'totalCommission',
      commissionAmount,
    );
    await this.distributionRepository.increment(
      { id: distributionId },
      'availableCommission',
      commissionAmount,
    );
  }

  /**
   * 冻结佣金
   */
  async freezeCommission(distributionId: string, amount: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const distribution = await manager.findOne(Distribution, {
        where: { id: distributionId },
      });

      if (!distribution || distribution.availableCommission < amount) {
        throw new CustomException(CodeEnum.INSUFFICIENT_COMMISSION);
      }

      await manager.decrement(
        Distribution,
        { id: distributionId },
        'availableCommission',
        amount,
      );
      await manager.increment(
        Distribution,
        { id: distributionId },
        'frozenCommission',
        amount,
      );
    });
  }

  /**
   * 解冻佣金
   */
  async unfreezeCommission(distributionId: string, amount: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const distribution = await manager.findOne(Distribution, {
        where: { id: distributionId },
      });

      if (!distribution || distribution.frozenCommission < amount) {
        throw new CustomException(CodeEnum.INSUFFICIENT_COMMISSION);
      }

      await manager.decrement(
        Distribution,
        { id: distributionId },
        'frozenCommission',
        amount,
      );
      await manager.increment(
        Distribution,
        { id: distributionId },
        'availableCommission',
        amount,
      );
    });
  }

  /**
   * 扣减可用佣金（提现时使用�?
   */
  async deductAvailableCommission(distributionId: string, amount: number): Promise<void> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
    });

    if (!distribution || distribution.availableCommission < amount) {
      throw new CustomException(CodeEnum.INSUFFICIENT_COMMISSION);
    }

    await this.distributionRepository.decrement(
      { id: distributionId },
      'availableCommission',
      amount,
    );
  }

  /**
   * 重置月度统计（每月初调用�?
   */
  async resetMonthlyStats(): Promise<void> {
    await this.distributionRepository
      .createQueryBuilder()
      .update(Distribution)
      .set({
        monthOrderAmount: 0,
        monthOrderCount: 0,
      })
      .execute();
  }

  /**
   * 获取分销员团队信�?
   */
  async getDistributionTeam(distributionId: string, level: number = 1): Promise<Distribution[]> {
    return await this.distributionRepository.find({
      where: { parentId: distributionId },
      relations: ['member'],
    });
  }

  /**
   * 禁用/启用分销�?
   */
  async toggleDistributionStatus(
    id: string,
    status: 'approved' | 'disabled',
    reason?: string,
  ): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id },
    });
    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    distribution.status = status;
    if (status === 'disabled') {
      distribution.disabledTime = new Date();
      distribution.disabledReason = reason;
    } else {
      distribution.disabledTime = null;
      distribution.disabledReason = null;
    }

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 获取分销员列�?
   */
  async getDistributionList(
    page: number = 1,
    limit: number = 10,
    status?: string,
    level?: number,
    keyword?: string,
  ): Promise<[Distribution[], number]> {
    const queryBuilder = this.distributionRepository
      .createQueryBuilder('distribution')
      .leftJoinAndSelect('distribution.member', 'member')
      .leftJoinAndSelect('distribution.parent', 'parent');

    if (status) {
      queryBuilder.andWhere('distribution.status = :status', { status });
    }

    if (level) {
      queryBuilder.andWhere('distribution.level = :level', { level });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(member.nickname LIKE :keyword OR member.mobile LIKE :keyword OR distribution.distributionCode LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('distribution.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取分销员下级树形结�?
   */
  async getDistributionTree(distributionId: string): Promise<any> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
      relations: ['member'],
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    const children = await this.getDistributionTeam(distributionId);
    const result = {
      ...distribution,
      children: [],
    };

    for (const child of children) {
      const childTree = await this.getDistributionTree(child.id);
      result.children.push(childTree);
    }

    return result;
  }

  /**
   * 批量更新等级
   */
  async batchUpdateLevel(distributionIds: string[], newLevel: number): Promise<void> {
    await this.distributionRepository
      .createQueryBuilder()
      .update(Distribution)
      .set({ level: newLevel })
      .where('id IN (:...ids)', { ids: distributionIds })
      .execute();
  }
}
