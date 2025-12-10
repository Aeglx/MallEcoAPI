import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { DistributionOrder } from '../entities/distribution-order.entity';
import { DistributionOrderSearchParams } from '../dto/distribution-order-search.dto';
import { DistributionOrderStatusEnum } from '../enums/distribution-order-status.enum';

@Injectable()
export class DistributionOrderService {
  constructor(
    @InjectRepository(DistributionOrder)
    private distributionOrderRepository: Repository<DistributionOrder>,
  ) {}

  /**
   * 创建分销订单
   */
  async createDistributionOrder(orderData: Partial<DistributionOrder>): Promise<DistributionOrder> {
    const distributionOrder = new DistributionOrder();
    Object.assign(distributionOrder, orderData);

    return await this.distributionOrderRepository.save(distributionOrder);
  }

  /**
   * 更新分销订单状态
   */
  async updateDistributionOrderStatus(
    id: string, 
    status: DistributionOrderStatusEnum
  ): Promise<DistributionOrder> {
    const distributionOrder = await this.distributionOrderRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionOrder) {
      throw new NotFoundException('分销订单不存在');
    }

    distributionOrder.distributionOrderStatus = status;
    return await this.distributionOrderRepository.save(distributionOrder);
  }

  /**
   * 根据ID获取分销订单
   */
  async getDistributionOrderById(id: string): Promise<DistributionOrder> {
    const distributionOrder = await this.distributionOrderRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionOrder) {
      throw new NotFoundException('分销订单不存在');
    }

    return distributionOrder;
  }

  /**
   * 分页查询分销订单列表
   */
  async getDistributionOrderPage(searchParams: DistributionOrderSearchParams): Promise<{ items: DistributionOrder[], total: number }> {
    const { 
      distributionId,
      memberId,
      orderSn,
      orderItemSn,
      distributionOrderStatus,
      storeId,
      goodsId,
      goodsName,
      minRebate,
      maxRebate,
      startTime,
      endTime,
      page = 1, 
      pageSize = 10 
    } = searchParams;

    const queryBuilder = this.distributionOrderRepository
      .createQueryBuilder('distributionOrder')
      .where('distributionOrder.deleteFlag = :deleteFlag', { deleteFlag: false });

    if (distributionId) {
      queryBuilder.andWhere('distributionOrder.distributionId = :distributionId', { distributionId });
    }

    if (memberId) {
      queryBuilder.andWhere('distributionOrder.memberId = :memberId', { memberId });
    }

    if (orderSn) {
      queryBuilder.andWhere('distributionOrder.orderSn LIKE :orderSn', { 
        orderSn: `%${orderSn}%` 
      });
    }

    if (orderItemSn) {
      queryBuilder.andWhere('distributionOrder.orderItemSn LIKE :orderItemSn', { 
        orderItemSn: `%${orderItemSn}%` 
      });
    }

    if (distributionOrderStatus) {
      queryBuilder.andWhere('distributionOrder.distributionOrderStatus = :distributionOrderStatus', { 
        distributionOrderStatus 
      });
    }

    if (storeId) {
      queryBuilder.andWhere('distributionOrder.storeId = :storeId', { storeId });
    }

    if (goodsId) {
      queryBuilder.andWhere('distributionOrder.goodsId = :goodsId', { goodsId });
    }

    if (goodsName) {
      queryBuilder.andWhere('distributionOrder.goodsName LIKE :goodsName', { 
        goodsName: `%${goodsName}%` 
      });
    }

    if (minRebate !== undefined) {
      queryBuilder.andWhere('distributionOrder.rebate >= :minRebate', { minRebate });
    }

    if (maxRebate !== undefined) {
      queryBuilder.andWhere('distributionOrder.rebate <= :maxRebate', { maxRebate });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('distributionOrder.createTime BETWEEN :startTime AND :endTime', { 
        startTime, 
        endTime 
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('distributionOrder.createTime', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据分销员ID获取订单列表
   */
  async getOrdersByDistributionId(distributionId: string): Promise<DistributionOrder[]> {
    return await this.distributionOrderRepository.find({
      where: { distributionId, deleteFlag: false },
      order: { createTime: 'DESC' }
    });
  }

  /**
   * 根据订单编号获取分销订单
   */
  async getDistributionOrderByOrderSn(orderSn: string): Promise<DistributionOrder> {
    return await this.distributionOrderRepository.findOne({
      where: { orderSn, deleteFlag: false }
    });
  }

  /**
   * 处理分销订单退款
   */
  async handleDistributionOrderRefund(orderItemSn: string, refundAmount: number): Promise<void> {
    const distributionOrder = await this.distributionOrderRepository.findOne({
      where: { orderItemSn, deleteFlag: false }
    });

    if (!distributionOrder) {
      throw new NotFoundException('分销订单不存在');
    }

    if (distributionOrder.rebate < refundAmount) {
      throw new BadRequestException('退款金额不能大于提成金额');
    }

    distributionOrder.sellBackRebate = refundAmount;
    distributionOrder.distributionOrderStatus = DistributionOrderStatusEnum.REFUNDED;

    await this.distributionOrderRepository.save(distributionOrder);
  }

  /**
   * 获取分销订单统计信息
   */
  async getDistributionOrderStatistics(distributionId?: string): Promise<any> {
    let whereCondition = { deleteFlag: false };
    if (distributionId) {
      whereCondition['distributionId'] = distributionId;
    }

    const totalCount = await this.distributionOrderRepository.count({
      where: whereCondition
    });

    const completedCount = await this.distributionOrderRepository.count({
      where: { 
        ...whereCondition,
        distributionOrderStatus: DistributionOrderStatusEnum.COMPLETED 
      }
    });

    const refundedCount = await this.distributionOrderRepository.count({
      where: { 
        ...whereCondition,
        distributionOrderStatus: DistributionOrderStatusEnum.REFUNDED 
      }
    });

    // 计算总提成金额
    const result = await this.distributionOrderRepository
      .createQueryBuilder('distributionOrder')
      .select('SUM(distributionOrder.rebate)', 'totalRebate')
      .where(whereCondition)
      .getRawOne();

    const totalRebate = parseFloat(result.totalRebate) || 0;

    return {
      totalCount,
      completedCount,
      refundedCount,
      totalRebate
    };
  }
}