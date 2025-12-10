import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Distribution } from '../entities/distribution.entity';
import { DistributionApplyDTO } from '../dto/distribution-apply.dto';
import { DistributionSearchParams } from '../dto/distribution-search.dto';
import { DistributionStatusEnum } from '../enums/distribution-status.enum';

@Injectable()
export class DistributionService {
  constructor(
    @InjectRepository(Distribution)
    private distributionRepository: Repository<Distribution>,
  ) {}

  /**
   * 申请成为分销员
   */
  async applyDistribution(memberId: string, memberName: string, applyDto: DistributionApplyDTO): Promise<Distribution> {
    // 检查用户是否已经是分销员
    const existingDistribution = await this.distributionRepository.findOne({
      where: { memberId, deleteFlag: false }
    });

    if (existingDistribution) {
      throw new BadRequestException('用户已经申请过分销员');
    }

    // 创建分销员申请
    const distribution = new Distribution();
    distribution.memberId = memberId;
    distribution.memberName = memberName;
    distribution.name = applyDto.name;
    distribution.idNumber = applyDto.idNumber;
    distribution.settlementBankAccountName = applyDto.settlementBankAccountName;
    distribution.settlementBankAccountNum = applyDto.settlementBankAccountNum;
    distribution.settlementBankBranchName = applyDto.settlementBankBranchName;
    distribution.distributionOrderCount = 0;
    distribution.rebateTotal = 0;
    distribution.canRebate = 0;
    distribution.commissionFrozen = 0;
    distribution.distributionOrderPrice = 0;
    distribution.distributionStatus = DistributionStatusEnum.APPLY;

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 审核分销员申请
   */
  async auditDistribution(id: string, status: DistributionStatusEnum, auditRemark?: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    if (distribution.distributionStatus !== DistributionStatusEnum.APPLY) {
      throw new BadRequestException('只能审核待审核状态的申请');
    }

    distribution.distributionStatus = status;
    distribution.updateBy = auditRemark || '';

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 获取当前用户的分销员信息
   */
  async getDistributionByMemberId(memberId: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { memberId, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('用户还不是分销员');
    }

    return distribution;
  }

  /**
   * 绑定分销员
   */
  async bindingDistribution(memberId: string, distributionId: string): Promise<void> {
    // 这里可以实现分销员绑定逻辑，比如上下级关系
    // 暂时作为占位符方法
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    // TODO: 实现绑定逻辑
  }

  /**
   * 分页查询分销员列表
   */
  async getDistributionList(searchParams: DistributionSearchParams): Promise<{ items: Distribution[], total: number }> {
    const { 
      memberId, 
      memberName, 
      distributionStatus, 
      storeId, 
      startTime, 
      endTime, 
      page = 1, 
      pageSize = 10 
    } = searchParams;

    const queryBuilder = this.distributionRepository
      .createQueryBuilder('distribution')
      .where('distribution.deleteFlag = :deleteFlag', { deleteFlag: false });

    if (memberId) {
      queryBuilder.andWhere('distribution.memberId LIKE :memberId', { memberId: `%${memberId}%` });
    }

    if (memberName) {
      queryBuilder.andWhere('distribution.memberName LIKE :memberName', { memberName: `%${memberName}%` });
    }

    if (distributionStatus) {
      queryBuilder.andWhere('distribution.distributionStatus = :distributionStatus', { distributionStatus });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('distribution.createTime BETWEEN :startTime AND :endTime', { 
        startTime, 
        endTime 
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('distribution.createTime', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取分销员信息
   */
  async getDistributionById(id: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    return distribution;
  }

  /**
   * 更新分销员信息
   */
  async updateDistribution(id: string, updateData: Partial<Distribution>): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    Object.assign(distribution, updateData);
    return await this.distributionRepository.save(distribution);
  }

  /**
   * 删除分销员（软删除）
   */
  async deleteDistribution(id: string): Promise<void> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    distribution.deleteFlag = true;
    await this.distributionRepository.save(distribution);
  }

  /**
   * 启用/禁用分销员
   */
  async toggleDistributionStatus(id: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    if (distribution.distributionStatus === DistributionStatusEnum.DISABLE) {
      distribution.distributionStatus = DistributionStatusEnum.PASS;
    } else {
      distribution.distributionStatus = DistributionStatusEnum.DISABLE;
    }

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 获取分销员统计信息
   */
  async getDistributionStatistics(): Promise<any> {
    const totalCount = await this.distributionRepository.count({
      where: { deleteFlag: false }
    });

    const pendingCount = await this.distributionRepository.count({
      where: { 
        distributionStatus: DistributionStatusEnum.APPLY, 
        deleteFlag: false 
      }
    });

    const activeCount = await this.distributionRepository.count({
      where: { 
        distributionStatus: DistributionStatusEnum.PASS, 
        deleteFlag: false 
      }
    });

    const disabledCount = await this.distributionRepository.count({
      where: { 
        distributionStatus: DistributionStatusEnum.DISABLE, 
        deleteFlag: false 
      }
    });

    return {
      totalCount,
      pendingCount,
      activeCount,
      disabledCount
    };
  }

  /**
   * 检查分销设置
   */
  async checkDistributionSetting(): Promise<void> {
    // TODO: 实现分销设置检查逻辑
    // 检查系统是否开启了分销功能
  }

  /**
   * 更新分销员佣金统计
   */
  async updateDistributionCommission(
    distributionId: string, 
    rebateAmount: number, 
    isFrozen: boolean = true
  ): Promise<void> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    if (isFrozen) {
      distribution.commissionFrozen += rebateAmount;
    } else {
      distribution.canRebate += rebateAmount;
    }
    
    distribution.rebateTotal += rebateAmount;
    distribution.distributionOrderCount += 1;

    await this.distributionRepository.save(distribution);
  }

  /**
   * 解冻分销员佣金
   */
  async unfreezeDistributionCommission(distributionId: string, amount: number): Promise<void> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    if (distribution.commissionFrozen < amount) {
      throw new BadRequestException('冻结金额不足');
    }

    distribution.commissionFrozen -= amount;
    distribution.canRebate += amount;

    await this.distributionRepository.save(distribution);
  }
}