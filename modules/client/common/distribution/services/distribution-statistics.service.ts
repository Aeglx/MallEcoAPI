import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distribution } from '../entities/distribution.entity';
import { DistributionOrder } from '../entities/distribution-order.entity';
import { DistributionCash } from '../entities/distribution-cash.entity';
import { DistributionLink } from '../entities/distribution-link.entity';
import { DistributionGoods } from '../entities/distribution-goods.entity';

@Injectable()
export class DistributionStatisticsService {
  constructor(
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(DistributionOrder)
    private readonly distributionOrderRepository: Repository<DistributionOrder>,
    @InjectRepository(DistributionCash)
    private readonly distributionCashRepository: Repository<DistributionCash>,
    @InjectRepository(DistributionLink)
    private readonly distributionLinkRepository: Repository<DistributionLink>,
    @InjectRepository(DistributionGoods)
    private readonly distributionGoodsRepository: Repository<DistributionGoods>,
  ) {}

  /**
   * 获取分销总览统计
   */
  async getOverviewStats(): Promise<{
    totalDistributions: number;
    approvedDistributions: number;
    totalCommission: number;
    availableCommission: number;
    frozenCommission: number;
    totalOrderAmount: number;
    totalOrderCount: number;
    totalCashAmount: number;
    pendingCashAmount: number;
  }> {
    const [distributionStats, orderStats, cashStats] = await Promise.all([
      this.getDistributionOverviewStats(),
      this.getOrderOverviewStats(),
      this.getCashOverviewStats(),
    ]);

    return {
      ...distributionStats,
      ...orderStats,
      ...cashStats,
    };
  }

  /**
   * 获取分销员概览统计
   */
  private async getDistributionOverviewStats(): Promise<{
    totalDistributions: number;
    approvedDistributions: number;
    totalCommission: number;
    availableCommission: number;
    frozenCommission: number;
  }> {
    const result = await this.distributionRepository
      .createQueryBuilder('distribution')
      .select([
        'COUNT(*) as totalDistributions',
        'SUM(CASE WHEN distribution.status = "approved" THEN 1 ELSE 0 END) as approvedDistributions',
        'SUM(distribution.totalCommission) as totalCommission',
        'SUM(distribution.availableCommission) as availableCommission',
        'SUM(distribution.frozenCommission) as frozenCommission',
      ])
      .getRawOne();

    return {
      totalDistributions: parseInt(result.totalDistributions) || 0,
      approvedDistributions: parseInt(result.approvedDistributions) || 0,
      totalCommission: parseFloat(result.totalCommission) || 0,
      availableCommission: parseFloat(result.availableCommission) || 0,
      frozenCommission: parseFloat(result.frozenCommission) || 0,
    };
  }

  /**
   * 获取订单概览统计
   */
  private async getOrderOverviewStats(): Promise<{
    totalOrderAmount: number;
    totalOrderCount: number;
  }> {
    const result = await this.distributionOrderRepository
      .createQueryBuilder('order')
      .select([
        'COUNT(DISTINCT order.orderId) as totalOrderCount',
        'SUM(order.orderAmount) as totalOrderAmount',
      ])
      .where('order.commissionStatus IN (:...statuses)', {
        statuses: ['confirmed', 'paid', 'completed'],
      })
      .getRawOne();

    return {
      totalOrderAmount: parseFloat(result.totalOrderAmount) || 0,
      totalOrderCount: parseInt(result.totalOrderCount) || 0,
    };
  }

  /**
   * 获取提现概览统计
   */
  private async getCashOverviewStats(): Promise<{
    totalCashAmount: number;
    pendingCashAmount: number;
  }> {
    const result = await this.distributionCashRepository
      .createQueryBuilder('cash')
      .select([
        'SUM(cash.cashAmount) as totalCashAmount',
        'SUM(CASE WHEN cash.status = "pending" OR cash.status = "processing" THEN cash.cashAmount ELSE 0 END) as pendingCashAmount',
      ])
      .where('cash.status IN (:...statuses)', {
        statuses: ['processing', 'completed'],
      })
      .getRawOne();

    return {
      totalCashAmount: parseFloat(result.totalCashAmount) || 0,
      pendingCashAmount: parseFloat(result.pendingCashAmount) || 0,
    };
  }

  /**
   * 获取时间趋势统计
   */
  async getTimeTrendStats(
    type: 'daily' | 'weekly' | 'monthly' = 'daily',
    startTime?: Date,
    endTime?: Date,
  ): Promise<any[]> {
    const dateFormat = {
      daily: '%Y-%m-%d',
      weekly: '%Y-%u',
      monthly: '%Y-%m',
    }[type];

    const queryBuilder = this.distributionOrderRepository
      .createQueryBuilder('order')
      .select([
        `DATE_FORMAT(order.createTime, '${dateFormat}') as timeGroup`,
        'COUNT(DISTINCT order.orderId) as orderCount',
        'SUM(order.orderAmount) as orderAmount',
        'SUM(order.totalCommission) as commissionAmount',
        'COUNT(DISTINCT order.distributionId) as activeDistributions',
      ])
      .where('order.commissionStatus IN (:...statuses)', {
        statuses: ['confirmed', 'paid', 'completed'],
      });

    if (startTime) {
      queryBuilder.andWhere('order.createTime >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('order.createTime <= :endTime', { endTime });
    }

    return await queryBuilder
      .groupBy('timeGroup')
      .orderBy('timeGroup', 'ASC')
      .getRawMany();
  }

  /**
   * 获取分销员排行榜
   */
  async getDistributionRanking(
    type: 'commission' | 'orders' | 'team' = 'commission',
    period: 'daily' | 'weekly' | 'monthly' | 'total' = 'monthly',
    limit: number = 10,
  ): Promise<any[]> {
    const orderByMap = {
      commission: 'commissionAmount',
      orders: 'orderCount',
      team: 'teamCount',
    };

    const queryBuilder = this.distributionRepository
      .createQueryBuilder('distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'distribution.id',
        'distribution.distributionCode',
        'member.nickname',
        'member.avatar',
        'distribution.totalCommission',
        'distribution.totalOrderCount',
        'distribution.totalOrderAmount',
        'distribution.teamCount',
        'distribution.directCount',
      ])
      .where('distribution.status = :status', { status: 'approved' });

    if (period !== 'total') {
      // 添加时间条件，这里简化处理
      const timeCondition = this.getTimeCondition(period);
      queryBuilder.andWhere(timeCondition);
    }

    // 根据类型添加排序
    switch (type) {
      case 'commission':
        queryBuilder.orderBy('distribution.totalCommission', 'DESC');
        break;
      case 'orders':
        queryBuilder.orderBy('distribution.totalOrderCount', 'DESC');
        break;
      case 'team':
        queryBuilder.orderBy('distribution.teamCount', 'DESC');
        break;
    }

    queryBuilder.limit(limit);

    return await queryBuilder.getRawMany();
  }

  /**
   * 获取时间条件
   */
  private getTimeCondition(period: string): string {
    const now = new Date();
    switch (period) {
      case 'daily':
        return `distribution.updateTime >= CURDATE()`;
      case 'weekly':
        return `distribution.updateTime >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      case 'monthly':
        return `distribution.updateTime >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      default:
        return '1=1';
    }
  }

  /**
   * 获取商品分销排行
   */
  async getProductDistributionRanking(limit: number = 10): Promise<any[]> {
    return await this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .leftJoin('goods.product', 'product')
      .select([
        'goods.id',
        'product.id as productId',
        'product.name',
        'product.image',
        'goods.totalSales',
        'goods.totalCommission',
        'goods.clickCount',
        'goods.convertCount',
        'goods.convertRate',
        'COUNT(DISTINCT goods.distributionId) as distributionCount',
      ])
      .where('goods.status = :status', { status: 'active' })
      .groupBy('goods.productId')
      .orderBy('goods.totalSales', 'DESC')
      .addOrderBy('goods.totalCommission', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * 获取分销员详细统计
   */
  async getDistributionDetailStats(distributionId: string): Promise<any> {
    // 基本信息
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
      relations: ['member'],
    });

    if (!distribution) {
      throw new Error('Distribution not found');
    }

    // 订单统计
    const orderStats = await this.distributionOrderRepository
      .createQueryBuilder('order')
      .select([
        'COUNT(*) as totalOrders',
        'SUM(order.orderAmount) as totalOrderAmount',
        'SUM(order.totalCommission) as totalCommission',
        'SUM(CASE WHEN order.commissionStatus = "pending" THEN order.totalCommission ELSE 0 END) as pendingCommission',
        'SUM(CASE WHEN order.commissionStatus = "confirmed" THEN order.totalCommission ELSE 0 END) as confirmedCommission',
        'SUM(CASE WHEN order.commissionStatus = "paid" THEN order.totalCommission ELSE 0 END) as paidCommission',
      ])
      .where('order.distributionId = :distributionId', { distributionId })
      .getRawOne();

    // 提现统计
    const cashStats = await this.distributionCashRepository
      .createQueryBuilder('cash')
      .select([
        'COUNT(*) as totalCashRecords',
        'SUM(cash.cashAmount) as totalCashAmount',
        'SUM(CASE WHEN cash.status = "pending" THEN cash.cashAmount ELSE 0 END) as pendingCashAmount',
        'SUM(CASE WHEN cash.status = "processing" THEN cash.cashAmount ELSE 0 END) as processingCashAmount',
        'SUM(CASE WHEN cash.status = "completed" THEN cash.cashAmount ELSE 0 END) as completedCashAmount',
      ])
      .where('cash.distributionId = :distributionId', { distributionId })
      .getRawOne();

    // 链接统计
    const linkStats = await this.distributionLinkRepository
      .createQueryBuilder('link')
      .select([
        'COUNT(*) as totalLinks',
        'SUM(link.clickCount) as totalClicks',
        'SUM(link.orderCount) as totalOrders',
        'SUM(link.orderAmount) as totalOrderAmount',
        'AVG(link.convertRate) as avgConvertRate',
      ])
      .where('link.distributionId = :distributionId', { distributionId })
      .getRawOne();

    // 商品统计
    const goodsStats = await this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .select([
        'COUNT(*) as totalGoods',
        'SUM(goods.totalSales) as totalSales',
        'SUM(goods.totalCommission) as totalCommission',
        'SUM(goods.clickCount) as totalClicks',
        'AVG(goods.convertRate) as avgConvertRate',
      ])
      .where('goods.distributionId = :distributionId', { distributionId })
      .getRawOne();

    return {
      distribution: {
        id: distribution.id,
        distributionCode: distribution.distributionCode,
        level: distribution.level,
        status: distribution.status,
        member: distribution.member,
        teamCount: distribution.teamCount,
        directCount: distribution.directCount,
        totalCommission: distribution.totalCommission,
        availableCommission: distribution.availableCommission,
        frozenCommission: distribution.frozenCommission,
      },
      orderStats: {
        totalOrders: parseInt(orderStats.totalOrders) || 0,
        totalOrderAmount: parseFloat(orderStats.totalOrderAmount) || 0,
        totalCommission: parseFloat(orderStats.totalCommission) || 0,
        pendingCommission: parseFloat(orderStats.pendingCommission) || 0,
        confirmedCommission: parseFloat(orderStats.confirmedCommission) || 0,
        paidCommission: parseFloat(orderStats.paidCommission) || 0,
      },
      cashStats: {
        totalCashRecords: parseInt(cashStats.totalCashRecords) || 0,
        totalCashAmount: parseFloat(cashStats.totalCashAmount) || 0,
        pendingCashAmount: parseFloat(cashStats.pendingCashAmount) || 0,
        processingCashAmount: parseFloat(cashStats.processingCashAmount) || 0,
        completedCashAmount: parseFloat(cashStats.completedCashAmount) || 0,
      },
      linkStats: {
        totalLinks: parseInt(linkStats.totalLinks) || 0,
        totalClicks: parseInt(linkStats.totalClicks) || 0,
        totalOrders: parseInt(linkStats.totalOrders) || 0,
        totalOrderAmount: parseFloat(linkStats.totalOrderAmount) || 0,
        avgConvertRate: parseFloat(linkStats.avgConvertRate) || 0,
      },
      goodsStats: {
        totalGoods: parseInt(goodsStats.totalGoods) || 0,
        totalSales: parseInt(goodsStats.totalSales) || 0,
        totalCommission: parseFloat(goodsStats.totalCommission) || 0,
        totalClicks: parseInt(goodsStats.totalClicks) || 0,
        avgConvertRate: parseFloat(goodsStats.avgConvertRate) || 0,
      },
    };
  }

  /**
   * 获取地域分布统计
   */
  async getRegionDistributionStats(limit: number = 20): Promise<any[]> {
    // 这里需要根据实际的地域字段进行调整
    return await this.distributionRepository
      .createQueryBuilder('distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'member.region as region',
        'COUNT(*) as distributionCount',
        'SUM(distribution.totalCommission) as totalCommission',
        'SUM(distribution.totalOrderAmount) as totalOrderAmount',
      ])
      .where('distribution.status = :status', { status: 'approved' })
      .andWhere('member.region IS NOT NULL')
      .groupBy('member.region')
      .orderBy('totalCommission', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * 导出统计数据
   */
  async exportStatistics(
    type: 'distribution' | 'order' | 'cash' | 'link' | 'goods',
    format: 'excel' | 'csv' = 'excel',
    filters?: any,
  ): Promise<string> {
    // 根据类型查询数据
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'distribution':
        data = await this.getDistributionDataForExport(filters);
        filename = `分销员数据_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'order':
        data = await this.getOrderDataForExport(filters);
        filename = `分销订单数据_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'cash':
        data = await this.getCashDataForExport(filters);
        filename = `提现数据_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'link':
        data = await this.getLinkDataForExport(filters);
        filename = `推广链接数据_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'goods':
        data = await this.getGoodsDataForExport(filters);
        filename = `分销商品数据_${new Date().toISOString().split('T')[0]}`;
        break;
    }

    // 这里应该调用导出服务生成文件
    // 简化实现，返回文件路径
    const filePath = `/exports/${filename}.${format}`;
    return filePath;
  }

  /**
   * 获取分销员导出数据
   */
  private async getDistributionDataForExport(filters?: any): Promise<any[]> {
    const queryBuilder = this.distributionRepository
      .createQueryBuilder('distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'distribution.distributionCode',
        'distribution.level',
        'distribution.status',
        'member.nickname',
        'member.mobile',
        'distribution.teamCount',
        'distribution.directCount',
        'distribution.totalCommission',
        'distribution.availableCommission',
        'distribution.frozenCommission',
        'distribution.totalOrderAmount',
        'distribution.totalOrderCount',
        'distribution.createTime',
      ]);

    if (filters?.status) {
      queryBuilder.andWhere('distribution.status = :status', { status: filters.status });
    }

    if (filters?.level) {
      queryBuilder.andWhere('distribution.level = :level', { level: filters.level });
    }

    if (filters?.startTime) {
      queryBuilder.andWhere('distribution.createTime >= :startTime', { startTime: filters.startTime });
    }

    if (filters?.endTime) {
      queryBuilder.andWhere('distribution.createTime <= :endTime', { endTime: filters.endTime });
    }

    return await queryBuilder.orderBy('distribution.createTime', 'DESC').getRawMany();
  }

  /**
   * 获取订单导出数据
   */
  private async getOrderDataForExport(filters?: any): Promise<any[]> {
    const queryBuilder = this.distributionOrderRepository
      .createQueryBuilder('order')
      .leftJoin('order.distribution', 'distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'order.orderSn',
        'order.orderAmount',
        'order.productAmount',
        'order.totalCommission',
        'order.commissionStatus',
        'order.commissionLevel',
        'distribution.distributionCode',
        'member.nickname',
        'order.createTime',
        'order.settlementTime',
      ]);

    if (filters?.distributionId) {
      queryBuilder.andWhere('order.distributionId = :distributionId', { 
        distributionId: filters.distributionId 
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('order.commissionStatus = :status', { status: filters.status });
    }

    if (filters?.startTime) {
      queryBuilder.andWhere('order.createTime >= :startTime', { startTime: filters.startTime });
    }

    if (filters?.endTime) {
      queryBuilder.andWhere('order.createTime <= :endTime', { endTime: filters.endTime });
    }

    return await queryBuilder.orderBy('order.createTime', 'DESC').getRawMany();
  }

  /**
   * 获取提现导出数据
   */
  private async getCashDataForExport(filters?: any): Promise<any[]> {
    const queryBuilder = this.distributionCashRepository
      .createQueryBuilder('cash')
      .leftJoin('cash.distribution', 'distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'cash.cashNo',
        'cash.cashAmount',
        'cash.feeAmount',
        'cash.actualAmount',
        'cash.cashMethod',
        'cash.accountNo',
        'cash.accountName',
        'cash.status',
        'distribution.distributionCode',
        'member.nickname',
        'cash.createTime',
        'cash.auditTime',
        'cash.completeTime',
      ]);

    if (filters?.status) {
      queryBuilder.andWhere('cash.status = :status', { status: filters.status });
    }

    if (filters?.cashMethod) {
      queryBuilder.andWhere('cash.cashMethod = :cashMethod', { cashMethod: filters.cashMethod });
    }

    if (filters?.startTime) {
      queryBuilder.andWhere('cash.createTime >= :startTime', { startTime: filters.startTime });
    }

    if (filters?.endTime) {
      queryBuilder.andWhere('cash.createTime <= :endTime', { endTime: filters.endTime });
    }

    return await queryBuilder.orderBy('cash.createTime', 'DESC').getRawMany();
  }

  /**
   * 获取链接导出数据
   */
  private async getLinkDataForExport(filters?: any): Promise<any[]> {
    const queryBuilder = this.distributionLinkRepository
      .createQueryBuilder('link')
      .leftJoin('link.distribution', 'distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'link.linkCode',
        'link.linkType',
        'link.linkTitle',
        'link.clickCount',
        'link.uvCount',
        'link.orderCount',
        'link.orderAmount',
        'link.commissionAmount',
        'link.convertRate',
        'link.status',
        'distribution.distributionCode',
        'member.nickname',
        'link.createTime',
      ]);

    if (filters?.distributionId) {
      queryBuilder.andWhere('link.distributionId = :distributionId', { 
        distributionId: filters.distributionId 
      });
    }

    if (filters?.linkType) {
      queryBuilder.andWhere('link.linkType = :linkType', { linkType: filters.linkType });
    }

    if (filters?.status) {
      queryBuilder.andWhere('link.status = :status', { status: filters.status });
    }

    if (filters?.startTime) {
      queryBuilder.andWhere('link.createTime >= :startTime', { startTime: filters.startTime });
    }

    if (filters?.endTime) {
      queryBuilder.andWhere('link.createTime <= :endTime', { endTime: filters.endTime });
    }

    return await queryBuilder.orderBy('link.createTime', 'DESC').getRawMany();
  }

  /**
   * 获取商品导出数据
   */
  private async getGoodsDataForExport(filters?: any): Promise<any[]> {
    const queryBuilder = this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .leftJoin('goods.distribution', 'distribution')
      .leftJoin('distribution.member', 'member')
      .leftJoin('goods.product', 'product')
      .select([
        'goods.id',
        'goods.commissionType',
        'goods.firstCommission',
        'goods.secondCommission',
        'goods.thirdCommission',
        'goods.totalSales',
        'goods.totalCommission',
        'goods.clickCount',
        'goods.convertCount',
        'goods.convertRate',
        'goods.status',
        'distribution.distributionCode',
        'member.nickname',
        'product.name as productName',
        'goods.createTime',
      ]);

    if (filters?.distributionId) {
      queryBuilder.andWhere('goods.distributionId = :distributionId', { 
        distributionId: filters.distributionId 
      });
    }

    if (filters?.productId) {
      queryBuilder.andWhere('goods.productId = :productId', { productId: filters.productId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('goods.status = :status', { status: filters.status });
    }

    return await queryBuilder.orderBy('goods.createTime', 'DESC').getRawMany();
  }
}