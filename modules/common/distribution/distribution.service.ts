import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Distribution } from './entities/distribution.entity';
import { DistributionApplyDto } from './dto/distribution-apply.dto';
import { DistributionAuditDto } from './dto/distribution-audit.dto';
import { DistributionQueryDto, DistributionStatus } from './dto/distribution-query.dto';
import { Member } from '../member/entities/member.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';
import { DistributionCashService } from './distribution-cash.service';
import { DistributionGoodsService } from './distribution-goods.service';
import { DistributionOrderService } from './distribution-order.service';

@Injectable()
export class DistributionService {
  constructor(
    @InjectRepository(Distribution)
    private distributionRepository: Repository<Distribution>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 申请成为分销员
   */
  async applyDistribution(memberId: string, applyDto: DistributionApplyDto): Promise<Distribution> {
    // 检查会员是否存在
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) {
      throw new CustomException(CodeEnum.USER_NOT_FOUND);
    }

    // 检查是否已经是分销员
    const existingDistribution = await this.distributionRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });
    if (existingDistribution) {
      if (existingDistribution.status === DistributionStatus.PENDING) {
        throw new CustomException(CodeEnum.DISTRIBUTION_APPLY_PENDING);
      } else if (existingDistribution.status === DistributionStatus.APPROVED) {
        throw new CustomException(CodeEnum.DISTRIBUTION_ALREADY_APPROVED);
      }
    }

    // 生成分销码
    const distributionCode = this.generateDistributionCode();

    // 处理推荐人关系
    let parentId = null;
    let parentCode = null;
    let path = '';
    
    if (applyDto.distributionCode) {
      const parentDistribution = await this.distributionRepository.findOne({
        where: { 
          distributionCode: applyDto.distributionCode,
          status: DistributionStatus.APPROVED,
          deleteFlag: 0
        }
      });
      
      if (parentDistribution) {
        parentId = parentDistribution.id;
        parentCode = parentDistribution.distributionCode;
        path = parentDistribution.path ? `${parentDistribution.path},${parentDistribution.id}` : parentDistribution.id;
      }
    }

    // 创建分销员记录
    const distribution = this.distributionRepository.create({
      memberId,
      memberName: member.nickname || member.username,
      mobile: member.mobile,
      avatar: member.avatar,
      distributionCode,
      parentId,
      parentCode,
      path,
      level: 1,
      status: DistributionStatus.PENDING,
      applyReason: applyDto.applyReason,
      storeId: applyDto.storeId,
      storeName: applyDto.storeName,
    });

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 审核分销员申请
   */
  async auditDistribution(auditDto: DistributionAuditDto, auditUserId: string, auditUserName: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: auditDto.id, deleteFlag: 0 }
    });
    
    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    if (distribution.status !== DistributionStatus.PENDING) {
      throw new CustomException(CodeEnum.DISTRIBUTION_ALREADY_AUDITED);
    }

    // 更新审核信息
    distribution.status = auditDto.status;
    distribution.auditReason = auditDto.auditReason;
    distribution.auditTime = new Date();
    distribution.auditUserId = auditUserId;
    distribution.auditUserName = auditUserName;

    const result = await this.distributionRepository.save(distribution);

    // 如果审核通过，需要更新上级的直推人数和团队人数
    if (auditDto.status === DistributionStatus.APPROVED && distribution.parentId) {
      await this.updateParentStats(distribution.parentId);
    }

    return result;
  }

  /**
   * 查询分销员列表
   */
  async getDistributionList(queryDto: DistributionQueryDto): Promise<{ items: Distribution[]; total: number }> {
    const { page = 1, limit = 20, memberName, mobile, distributionCode, status, level, parentCode, storeId, startTime, endTime, sortBy = 'create_time', sortOrder = 'DESC' } = queryDto;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberName) {
      whereCondition.memberName = Like(`%${memberName}%`);
    }
    if (mobile) {
      whereCondition.mobile = Like(`%${mobile}%`);
    }
    if (distributionCode) {
      whereCondition.distributionCode = distributionCode;
    }
    if (status !== undefined) {
      whereCondition.status = status;
    }
    if (level) {
      whereCondition.level = level;
    }
    if (parentCode) {
      whereCondition.parentCode = parentCode;
    }
    if (storeId) {
      whereCondition.storeId = storeId;
    }
    if (startTime && endTime) {
      whereCondition.createTime = Between(new Date(startTime), new Date(endTime));
    }

    const [items, total] = await this.distributionRepository.findAndCount({
      where: whereCondition,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取分销员详情
   */
  async getDistributionDetail(id: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: 0 },
      relations: ['parent', 'children'],
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    return distribution;
  }

  /**
   * 更新分销员状态
   */
  async updateDistributionStatus(id: string, status: DistributionStatus, reason?: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    distribution.status = status;
    distribution.updateTime = new Date();

    return await this.distributionRepository.save(distribution);
  }

  /**
   * 生成分销码
   */
  private generateDistributionCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${random}`.substring(0, 32);
  }

  /**
   * 更新上级统计信息
   */
  private async updateParentStats(parentId: string): Promise<void> {
    // 更新直推人数
    const directCount = await this.distributionRepository.count({
      where: { parentId, deleteFlag: 0 }
    });

    await this.distributionRepository.increment({ id: parentId }, 'directCount', directCount);

    // 递归更新团队人数
    const parent = await this.distributionRepository.findOne({ where: { id: parentId } });
    if (parent && parent.parentId) {
      await this.updateParentStats(parent.parentId);
    }
  }

  /**
   * 获取我的分销信息
   */
  async getMyDistribution(memberId: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { memberId, deleteFlag: 0 },
      relations: ['parent'],
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    return distribution;
  }

  /**
   * 获取我的团队
   */
  async getMyTeam(distributionId: string, level: number = 1): Promise<Distribution[]> {
    const whereCondition: any = { deleteFlag: 0 };
    
    if (level === 1) {
      whereCondition.parentId = distributionId;
    } else if (level === 2) {
      const level1Members = await this.distributionRepository.find({
        where: { parentId: distributionId, deleteFlag: 0 },
        select: ['id']
      });
      const level1Ids = level1Members.map(member => member.id);
      whereCondition.parentId = { $in: level1Ids };
    }

    const team = await this.distributionRepository.find({
      where: whereCondition,
      order: { createTime: 'DESC' },
    });

    return team;
  }

  /**
   * 获取佣金汇总
   */
  async getCommissionSummary(distributionId: string): Promise<{
    totalCommission: number;
    availableCommission: number;
    frozenCommission: number;
    totalWithdraw: number;
    todayCommission: number;
    monthCommission: number;
  }> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId, deleteFlag: 0 }
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 这里应该从分销订单表中计算今日和本月佣金
    // 简化实现，实际应该查询分销订单表
    const todayCommission = 0; // await this.getCommissionByDateRange(distributionId, today, now);
    const monthCommission = 0; // await this.getCommissionByDateRange(distributionId, monthStart, now);

    return {
      totalCommission: distribution.totalCommission,
      availableCommission: distribution.availableCommission,
      frozenCommission: distribution.frozenCommission,
      totalWithdraw: distribution.totalWithdraw,
      todayCommission,
      monthCommission,
    };
  }

  /**
   * 获取佣金记录
   */
  async getCommissionRecords(distributionId: string, queryDto: any): Promise<{ items: any[]; total: number }> {
    // 这里应该查询分销订单表
    // 简化实现
    return { items: [], total: 0 };
  }

  /**
   * 获取分享信息
   */
  async getShareInfo(distributionId: string): Promise<{
    shareUrl: string;
    qrCode: string;
    distributionCode: string;
  }> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId, deleteFlag: 0 }
    });

    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    const baseUrl = 'https://example.com'; // 应该从配置中获取
    const shareUrl = `${baseUrl}/product/list?distributionCode=${distribution.distributionCode}`;
    
    return {
      shareUrl,
      qrCode: distribution.qrCode || '',
      distributionCode: distribution.distributionCode,
    };
  }

  /**
   * 获取排行榜
   */
  async getRankings(type: string, period: string, limit: number = 10): Promise<any[]> {
    // 这里应该实现排行榜逻辑
    return [];
  }

  /**
   * 获取统计数据
   */
  async getStatistics(distributionId: string): Promise<{
    todayOrders: number;
    todaySales: number;
    monthOrders: number;
    monthSales: number;
    totalOrders: number;
    totalSales: number;
    teamMembers: number;
    newMembersToday: number;
  }> {
    // 简化实现，实际应该从相关表中统计
    return {
      todayOrders: 0,
      todaySales: 0,
      monthOrders: 0,
      monthSales: 0,
      totalOrders: 0,
      totalSales: 0,
      teamMembers: 0,
      newMembersToday: 0,
    };
  }

  /**
   * 获取管理端统计
   */
  async getManagerStatistics(): Promise<{
    totalDistributors: number;
    activeDistributors: number;
    pendingApplications: number;
    todayApplications: number;
    totalCommission: number;
    todayCommission: number;
    totalCashAmount: number;
    pendingCashAmount: number;
  }> {
    // 简化实现，实际应该从相关表中统计
    return {
      totalDistributors: 0,
      activeDistributors: 0,
      pendingApplications: 0,
      todayApplications: 0,
      totalCommission: 0,
      todayCommission: 0,
      totalCashAmount: 0,
      pendingCashAmount: 0,
    };
  }

  /**
   * 获取分销订单列表
   */
  async getDistributionOrderList(queryDto: any): Promise<{ items: any[]; total: number }> {
    // 简化实现，实际应该查询分销订单表
    return { items: [], total: 0 };
  }

  /**
   * 获取分销订单详情
   */
  async getDistributionOrderDetail(id: string): Promise<any> {
    // 简化实现
    return null;
  }

  /**
   * 获取佣金汇总
   */
  async getCommissionSummary(queryDto: any): Promise<{
    totalCommission: number;
    settledCommission: number;
    pendingCommission: number;
    todayCommission: number;
    monthCommission: number;
  }> {
    // 简化实现
    return {
      totalCommission: 0,
      settledCommission: 0,
      pendingCommission: 0,
      todayCommission: 0,
      monthCommission: 0,
    };
  }

  /**
   * 批量结算佣金
   */
  async settleCommission(body: any): Promise<{
    settledCount: number;
    settledAmount: number;
  }> {
    // 简化实现
    return {
      settledCount: 0,
      settledAmount: 0,
    };
  }

  /**
   * 更新分销员佣金
   */
  async updateCommission(distributionId: string, commissionAmount: number): Promise<void> {
    await this.distributionRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.increment(
        { id: distributionId },
        'totalCommission',
        commissionAmount
      );
      await transactionalEntityManager.increment(
        { id: distributionId },
        'availableCommission',
        commissionAmount
      );
    });
  }

  /**
   * 冻结佣金
   */
  async freezeCommission(distributionId: string, amount: number): Promise<void> {
    await this.distributionRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.decrement(
        { id: distributionId },
        'availableCommission',
        amount
      );
      await transactionalEntityManager.increment(
        { id: distributionId },
        'frozenCommission',
        amount
      );
    });
  }

  /**
   * 解冻佣金
   */
  async unfreezeCommission(distributionId: string, amount: number): Promise<void> {
    await this.distributionRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.decrement(
        { id: distributionId },
        'frozenCommission',
        amount
      );
      await transactionalEntityManager.increment(
        { id: distributionId },
        'availableCommission',
        amount
      );
    });
  }
}