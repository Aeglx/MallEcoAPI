import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DistributionOrder } from '../entities/distribution-order.entity';
import { Distribution } from '../entities/distribution.entity';
import { Order } from '../../order/entities/order.entity';
import { CustomException } from '../../filters/custom-exception';
import { CodeEnum } from '../../enums/code.enum';

@Injectable()
export class DistributionOrderService {
  constructor(
    @InjectRepository(DistributionOrder)
    private readonly distributionOrderRepository: Repository<DistributionOrder>,
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建分销订单
   */
  async createDistributionOrder(data: {
    orderId: string;
    buyerId: string;
    distributionId: string;
    parentDistributionId?: string;
    grandParentDistributionId?: string;
    productIds: string[];
    productNames: string[];
    skuIds: string[];
    skuNames: string[];
    quantities: number[];
    orderAmount: number;
    productAmount: number;
  }): Promise<DistributionOrder[]> {
    // 尝试使用createQueryBuilder进行查询
    const order = await this.orderRepository.createQueryBuilder('order')
      .where('order.id = :orderId', { orderId: data.orderId })
      .getOne();
    if (!order) {
      throw new CustomException(CodeEnum.ORDER_NOT_FOUND);
    }

    const results: DistributionOrder[] = [];

    return await this.dataSource.transaction(async manager => {
      // 一级分销订单
      const firstDistributionOrder = manager.create(DistributionOrder, {
        distributionId: data.distributionId,
        orderId: data.orderId,
        buyerId: data.buyerId,
        orderSn: order.orderSn,
        orderAmount: data.orderAmount,
        productAmount: data.productAmount,
        commissionLevel: 1,
        commissionStatus: 'pending',
        productIds: data.productIds.join(','),
        productNames: data.productNames.join(','),
        skuIds: data.skuIds.join(','),
        skuNames: data.skuNames.join(','),
        quantities: data.quantities.join(','),
      });

      const savedFirst = await manager.save(firstDistributionOrder);
      results.push(savedFirst);

      // 二级分销订单
      if (data.parentDistributionId) {
        const secondDistributionOrder = manager.create(DistributionOrder, {
          distributionId: data.parentDistributionId,
          orderId: data.orderId,
          buyerId: data.buyerId,
          orderSn: order.orderSn,
          orderAmount: data.orderAmount,
          productAmount: data.productAmount,
          commissionLevel: 2,
          commissionStatus: 'pending',
          productIds: data.productIds.join(','),
          productNames: data.productNames.join(','),
          skuIds: data.skuIds.join(','),
          skuNames: data.skuNames.join(','),
          quantities: data.quantities.join(','),
        });

        const savedSecond = await manager.save(secondDistributionOrder);
        results.push(savedSecond);
      }

      // 三级分销订单
      if (data.grandParentDistributionId) {
        const thirdDistributionOrder = manager.create(DistributionOrder, {
          distributionId: data.grandParentDistributionId,
          orderId: data.orderId,
          buyerId: data.buyerId,
          orderSn: order.orderSn,
          orderAmount: data.orderAmount,
          productAmount: data.productAmount,
          commissionLevel: 3,
          commissionStatus: 'pending',
          productIds: data.productIds.join(','),
          productNames: data.productNames.join(','),
          skuIds: data.skuIds.join(','),
          skuNames: data.skuNames.join(','),
          quantities: data.quantities.join(','),
        });

        const savedThird = await manager.save(thirdDistributionOrder);
        results.push(savedThird);
      }

      return results;
    });
  }

  /**
   * 确认分销佣金
   */
  async confirmCommission(orderId: string): Promise<void> {
    const distributionOrders = await this.distributionOrderRepository.find({
      where: { orderId, commissionStatus: 'pending' },
    });

    if (!distributionOrders.length) {
      return;
    }

    await this.dataSource.transaction(async manager => {
      for (const distributionOrder of distributionOrders) {
        // 计算佣金
        const commission = await this.calculateOrderCommission(distributionOrder);
        
        // 更新分销订单
        distributionOrder.firstCommission = commission.firstCommission;
        distributionOrder.secondCommission = commission.secondCommission;
        distributionOrder.thirdCommission = commission.thirdCommission;
        distributionOrder.totalCommission = commission.totalCommission;
        distributionOrder.commissionStatus = 'confirmed';

        await manager.save(distributionOrder);

        // 更新分销员统�?
        await manager.increment(
          Distribution,
          { id: distributionOrder.distributionId },
          'totalCommission',
          commission.totalCommission,
        );
        await manager.increment(
          Distribution,
          { id: distributionOrder.distributionId },
          'availableCommission',
          commission.totalCommission,
        );
      }
    });
  }

  /**
   * 计算订单佣金
   */
  private async calculateOrderCommission(distributionOrder: DistributionOrder): Promise<{
    firstCommission: number;
    secondCommission: number;
    thirdCommission: number;
    totalCommission: number;
  }> {
    // 这里应该根据分销商品配置计算佣金
    // 简化实现，实际应该查询分销商品配置
    const commissionRate = distributionOrder.commissionLevel === 1 ? 0.1 : 
                          distributionOrder.commissionLevel === 2 ? 0.05 : 0.02;
    
    const commission = distributionOrder.productAmount * commissionRate;

    return {
      firstCommission: distributionOrder.commissionLevel === 1 ? commission : 0,
      secondCommission: distributionOrder.commissionLevel === 2 ? commission : 0,
      thirdCommission: distributionOrder.commissionLevel === 3 ? commission : 0,
      totalCommission: commission,
    };
  }

  /**
   * 结算佣金
   */
  async settleCommission(orderId: string, settlementUserId: string): Promise<void> {
    const distributionOrders = await this.distributionOrderRepository.find({
      where: { orderId, commissionStatus: 'confirmed' },
    });

    if (!distributionOrders.length) {
      return;
    }

    await this.dataSource.transaction(async manager => {
      for (const distributionOrder of distributionOrders) {
        // 冻结佣金
        await manager.decrement(
          Distribution,
          { id: distributionOrder.distributionId },
          'availableCommission',
          distributionOrder.totalCommission,
        );
        await manager.increment(
          Distribution,
          { id: distributionOrder.distributionId },
          'frozenCommission',
          distributionOrder.totalCommission,
        );

        // 更新分销订单状�?
        distributionOrder.commissionStatus = 'paid';
        distributionOrder.settlementTime = new Date();
        distributionOrder.settlementUserId = settlementUserId;

        await manager.save(distributionOrder);
      }
    });
  }

  /**
   * 订单退款处�?
   */
  async handleOrderRefund(orderId: string, refundAmount: number): Promise<void> {
    const distributionOrders = await this.distributionOrderRepository.find({
      where: { orderId },
    });

    if (!distributionOrders.length) {
      return;
    }

    await this.dataSource.transaction(async manager => {
      for (const distributionOrder of distributionOrders) {
        // 计算退款佣�?
        const refundCommission = (refundAmount / distributionOrder.orderAmount) * 
                                 distributionOrder.totalCommission;

        // 更新分销订单
        distributionOrder.commissionStatus = 'refunded';
        distributionOrder.refundTime = new Date();
        distributionOrder.refundCommission = refundCommission;

        await manager.save(distributionOrder);

        // 扣减佣金统计
        await manager.decrement(
          Distribution,
          { id: distributionOrder.distributionId },
          'totalCommission',
          distributionOrder.totalCommission,
        );

        // 解冻相应佣金
        await manager.decrement(
          Distribution,
          { id: distributionOrder.distributionId },
          'frozenCommission',
          Math.min(refundCommission, distributionOrder.totalCommission),
        );
      }
    });
  }

  /**
   * 获取分销订单列表
   */
  async getDistributionOrderList(
    page: number = 1,
    limit: number = 10,
    distributionId?: string,
    status?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<[DistributionOrder[], number]> {
    const queryBuilder = this.distributionOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.distribution', 'distribution')
      .leftJoinAndSelect('distribution.member', 'member');

    if (distributionId) {
      queryBuilder.andWhere('order.distributionId = :distributionId', { distributionId });
    }

    if (status) {
      queryBuilder.andWhere('order.commissionStatus = :status', { status });
    }

    if (startTime) {
      queryBuilder.andWhere('order.createTime >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('order.createTime <= :endTime', { endTime });
    }

    queryBuilder
      .orderBy('order.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取分销订单详情
   */
  async getDistributionOrderById(id: string): Promise<DistributionOrder> {
    const distributionOrder = await this.distributionOrderRepository.findOne({
      where: { id },
      relations: ['distribution', 'distribution.member', 'order'],
    });
    if (!distributionOrder) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    return distributionOrder;
  }

  /**
   * 获取分销员的订单统计
   */
  async getDistributionOrderStats(distributionId: string): Promise<{
    totalOrders: number;
    totalAmount: number;
    totalCommission: number;
    pendingCommission: number;
    confirmedCommission: number;
    paidCommission: number;
    refundedCommission: number;
  }> {
    const result = await this.distributionOrderRepository
      .createQueryBuilder('order')
      .select([
        'COUNT(*) as totalOrders',
        'SUM(order.orderAmount) as totalAmount',
        'SUM(order.totalCommission) as totalCommission',
        'SUM(CASE WHEN order.commissionStatus = "pending" THEN order.totalCommission ELSE 0 END) as pendingCommission',
        'SUM(CASE WHEN order.commissionStatus = "confirmed" THEN order.totalCommission ELSE 0 END) as confirmedCommission',
        'SUM(CASE WHEN order.commissionStatus = "paid" THEN order.totalCommission ELSE 0 END) as paidCommission',
        'SUM(CASE WHEN order.commissionStatus = "refunded" THEN order.refundCommission ELSE 0 END) as refundedCommission',
      ])
      .where('order.distributionId = :distributionId', { distributionId })
      .getRawOne();

    return {
      totalOrders: parseInt(result.totalOrders) || 0,
      totalAmount: parseFloat(result.totalAmount) || 0,
      totalCommission: parseFloat(result.totalCommission) || 0,
      pendingCommission: parseFloat(result.pendingCommission) || 0,
      confirmedCommission: parseFloat(result.confirmedCommission) || 0,
      paidCommission: parseFloat(result.paidCommission) || 0,
      refundedCommission: parseFloat(result.refundedCommission) || 0,
    };
  }

  /**
   * 批量更新佣金状�?
   */
  async batchUpdateCommissionStatus(
    orderIds: string[],
    status: string,
    settlementUserId?: string,
  ): Promise<void> {
    const updateData: any = { commissionStatus: status };
    
    if (status === 'paid' && settlementUserId) {
      updateData.settlementTime = new Date();
      updateData.settlementUserId = settlementUserId;
    }

    await this.distributionOrderRepository
      .createQueryBuilder()
      .update(DistributionOrder)
      .set(updateData)
      .where('orderId IN (:...orderIds)', { orderIds })
      .execute();
  }

  /**
   * 获取佣金排行�?
   */
  async getCommissionRanking(
    type: 'daily' | 'weekly' | 'monthly' = 'monthly',
    limit: number = 10,
  ): Promise<any[]> {
    const queryBuilder = this.distributionOrderRepository
      .createQueryBuilder('order')
      .leftJoin('order.distribution', 'distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'distribution.id as distributionId',
        'distribution.distributionCode',
        'member.nickname',
        'SUM(order.totalCommission) as totalCommission',
        'COUNT(*) as orderCount',
      ])
      .where('order.commissionStatus IN (:...statuses)', { 
        statuses: ['confirmed', 'paid'] 
      })
      .groupBy('distribution.id')
      .orderBy('totalCommission', 'DESC')
      .limit(limit);

    // 根据类型添加时间条件
    const now = new Date();
    switch (type) {
      case 'daily':
        queryBuilder.andWhere('DATE(order.createTime) = CURDATE()');
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        queryBuilder.andWhere('order.createTime >= :weekAgo', { weekAgo });
        break;
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        queryBuilder.andWhere('order.createTime >= :monthAgo', { monthAgo });
        break;
    }

    return await queryBuilder.getRawMany();
  }
}
