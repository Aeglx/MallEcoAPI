import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BusinessException } from '../../../shared/exceptions/business.exception';
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
  async getDistributionStatistics(params?: { startDate?: string; endDate?: string }): Promise<any> {
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
   * 通过邀请码注册
   */
  async registerByInviteCode(inviteCode: string, data: { memberId: string; realName: string; mobile: string }): Promise<Distribution> {
    // 验证邀请码
    const inviterDistribution = await this.distributionRepository.findOne({
      where: { inviteCode, deleteFlag: false }
    });

    if (!inviterDistribution) {
      throw new BadRequestException('无效的邀请码');
    }

    // 检查用户是否已经是分销员
    const existingDistribution = await this.distributionRepository.findOne({
      where: { memberId: data.memberId, deleteFlag: false }
    });

    if (existingDistribution) {
      throw new BadRequestException('用户已经是分销员');
    }

    // 创建分销员
    const distribution = new Distribution();
    distribution.memberId = data.memberId;
    distribution.memberName = data.realName;
    distribution.name = data.realName;
    distribution.mobile = data.mobile;
    distribution.inviterId = inviterDistribution.id;
    distribution.inviteCode = this.generateInviteCode();
    distribution.distributionStatus = DistributionStatusEnum.NORMAL;
    distribution.distributionOrderCount = 0;
    distribution.rebateTotal = 0;
    distribution.canRebate = 0;
    distribution.commissionFrozen = 0;
    distribution.distributionOrderPrice = 0;

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 获取分销员邀请信息
   */
  async getDistributorInviteInfo(distributorId: string): Promise<any> {
    // TODO: 实现获取分销员邀请信息的逻辑
    return {};
  }

  /**
   * 申请成为分销员
   */
  async applyDistributor(data: { memberId: string; realName: string; mobile: string; idCard?: string; wechat?: string; qq?: string; bankName?: string; bankAccount?: string; accountName?: string; applyReason?: string }): Promise<Distribution> {
    // 检查用户是否已经是分销员
    const existingDistribution = await this.distributionRepository.findOne({
      where: { memberId: data.memberId, deleteFlag: false }
    });

    if (existingDistribution) {
      throw new BadRequestException('用户已经申请或成为分销员');
    }

    // 创建分销员申请
    const distribution = new Distribution();
    distribution.memberId = data.memberId;
    distribution.memberName = data.realName;
    distribution.name = data.realName;
    distribution.mobile = data.mobile;
    distribution.idNumber = data.idCard;
    distribution.wechat = data.wechat;
    distribution.qq = data.qq;
    distribution.settlementBankAccountName = data.accountName;
    distribution.settlementBankAccountNum = data.bankAccount;
    distribution.settlementBankBranchName = data.bankName;
    distribution.inviteCode = this.generateInviteCode();
    distribution.applyReason = data.applyReason;
    distribution.distributionStatus = DistributionStatusEnum.APPLY;
    distribution.distributionOrderCount = 0;
    distribution.rebateTotal = 0;
    distribution.canRebate = 0;
    distribution.commissionFrozen = 0;
    distribution.distributionOrderPrice = 0;

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 获取分销员列表
   */
  async getDistributorList(params: { page?: number; pageSize?: number; status?: string; level?: string }): Promise<any> {
    // TODO: 实现获取分销员列表的逻辑
    return { items: [], total: 0 };
  }

  /**
   * 获取分销员详情
   */
  async getDistributorById(distributorId: string): Promise<any> {
    // TODO: 实现获取分销员详情的逻辑
    return {};
  }

  /**
   * 根据会员ID获取分销员信息
   */
  async getDistributorByMemberId(memberId: string): Promise<any> {
    // TODO: 实现根据会员ID获取分销员信息的逻辑
    return {};
  }

  /**
   * 更新分销员信息
   */
  async updateDistributor(distributorId: string, updateData: any): Promise<any> {
    // TODO: 实现更新分销员信息的逻辑
    return {};
  }

  /**
   * 审核通过分销员
   */
  async approveDistributor(distributorId: string, data: { approveRemark?: string; operatorId: string }): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributorId, deleteFlag: false }
    });

    if (!distribution) {
      throw new NotFoundException('分销员不存在');
    }

    if (distribution.distributionStatus !== DistributionStatusEnum.APPLY) {
      throw new BadRequestException('只能审核待审核状态的申请');
    }

    distribution.distributionStatus = DistributionStatusEnum.NORMAL;
    distribution.updateBy = data.operatorId;
    distribution.approveTime = new Date();
    distribution.approveRemark = data.approveRemark;

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 拒绝分销员申请
   */
  async rejectDistributor(distributorId: string, data: { rejectReason: string; operatorId: string }): Promise<any> {
    // TODO: 实现拒绝分销员申请的逻辑
    return {};
  }

  /**
   * 冻结分销员
   */
  async freezeDistributor(distributorId: string, data: { freezeReason: string; operatorId: string }): Promise<any> {
    // TODO: 实现冻结分销员的逻辑
    return {};
  }

  /**
   * 解冻分销员
   */
  async unfreezeDistributor(distributorId: string, data: { unfreezeReason: string; operatorId: string }): Promise<any> {
    // TODO: 实现解冻分销员的逻辑
    return {};
  }

  /**
   * 调整分销员等级
   */
  async updateDistributorLevel(distributorId: string, data: { levelId: string; reason?: string; operatorId: string }): Promise<any> {
    // TODO: 实现调整分销员等级的逻辑
    return {};
  }

  /**
   * 获取佣金记录列表
   */
  async getCommissionRecords(params: { page?: number; pageSize?: number; distributorId?: string; type?: string; status?: string }): Promise<any> {
    // TODO: 实现获取佣金记录列表的逻辑
    return { items: [], total: 0 };
  }

  /**
   * 获取分销员佣金统计
   */
  async getDistributorCommission(distributorId: string): Promise<any> {
    // TODO: 实现获取分销员佣金统计的逻辑
    return {};
  }

  /**
   * 申请佣金提现
   */
  async applyCommissionWithdraw(data: { distributorId: string; withdrawAmount: number; bankName: string; bankAccount: string; accountName: string }): Promise<any> {
    // TODO: 实现申请佣金提现的逻辑
    return {};
  }

  /**
   * 获取提现申请列表
   */
  async getWithdrawApplications(params: { page?: number; pageSize?: number; status?: string }): Promise<any> {
    // TODO: 实现获取提现申请列表的逻辑
    return { items: [], total: 0 };
  }

  /**
   * 审核通过提现申请
   */
  async approveWithdrawApplication(applicationId: string, data: { approveRemark?: string; operatorId: string }): Promise<any> {
    // TODO: 实现审核通过提现申请的逻辑
    return {};
  }

  /**
   * 拒绝提现申请
   */
  async rejectWithdrawApplication(applicationId: string, data: { rejectReason: string; operatorId: string }): Promise<any> {
    // TODO: 实现拒绝提现申请的逻辑
    return {};
  }

  /**
   * 获取分销团队
   */
  async getDistributionTeam(distributorId: string, level?: string): Promise<any> {
    // TODO: 实现获取分销团队的逻辑
    return {};
  }

  /**
   * 获取分销商品列表
   */
  async getDistributionGoods(params: { page?: number; pageSize?: number; storeId?: string }): Promise<any> {
    // TODO: 实现获取分销商品列表的逻辑
    return { items: [], total: 0 };
  }

  /**
   * 设置分销商品佣金
   */
  async setGoodsCommission(goodsId: string, data: { commissionRate: number; fixedCommission?: number; isActive: boolean }): Promise<any> {
    // TODO: 实现设置分销商品佣金的逻辑
    return {};
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