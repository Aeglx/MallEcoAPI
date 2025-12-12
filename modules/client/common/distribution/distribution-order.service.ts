import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { DistributionOrder } from './entities/distribution-order.entity';
import { Distribution } from './entities/distribution.entity';
import { DistributionGoods } from './entities/distribution-goods.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class DistributionOrderService {
  constructor(
    @InjectRepository(DistributionOrder)
    private distributionOrderRepository: Repository<DistributionOrder>,
    @InjectRepository(Distribution)
    private distributionRepository: Repository<Distribution>,
    @InjectRepository(DistributionGoods)
    private distributionGoodsRepository: Repository<DistributionGoods>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 创建分销订单
   */
  async createDistributionOrder(orderId: string, distributionCode?: string): Promise<DistributionOrder[]> {
    const order = await this.orderRepository.findOne({
      where: { orderSn: orderId } as any,
      relations: ['orderItems'],
    });

    if (!order) {
      throw new CustomException(CodeEnum.ORDER_NOT_FOUND);
    }

    // 如果没有分销码，不创建分销订单
    if (!distributionCode) {
      return [];
    }

    // 查找分销员
    const distribution = await this.distributionRepository.findOne({
      where: { 
        distributionCode,
        status: 'approved' // 已通过审核
      }
    });

    if (!distribution) {
      return [];
    }

    const distributionOrders: DistributionOrder[] = [];

    // 为每个订单项创建分销订单记录
    for (const item of order.orderItems) {
      // 检查是否是分销商品
      const distributionGoods = await this.distributionGoodsRepository.findOne({
        where: { 
          productId: item.productId,
          status: 'active'
        }
      });

      if (!distributionGoods) {
        continue;
      }

      // 获取商品信息
      const product = await this.productRepository.findOne({
        where: { productId: item.productId } as any
      });

      // 简化佣金计算
      const commissionRate = distributionGoods.firstCommission || 0;
      const commissionAmount = item.price * item.quantity * (commissionRate / 100);

      // 创建分销订单记录
        const distributionOrder = this.distributionOrderRepository.create({
          orderId: order.orderSn,
          orderSn: order.orderSn,
          distributionId: distribution.id,
          parentDistributionId: distribution.parentId,
          buyerId: order.memberId,
          orderAmount: order.totalAmount,
          productAmount: item.price * item.quantity,
          firstCommission: commissionAmount,
          totalCommission: commissionAmount,
          commissionStatus: 'pending', // 待结算
          commissionRate,
          commissionLevel: 1,
        });

      distributionOrders.push(distributionOrder);
    }

    // 批量保存分销订单
    if (distributionOrders.length > 0) {
      await this.distributionOrderRepository.save(distributionOrders);
    }

    return distributionOrders;
  }

  /**
   * 创建多级分销订单
   */
  async createMultiLevelDistributionOrder(orderId: string, distributionCode?: string): Promise<DistributionOrder[]> {
    const order = await this.orderRepository.findOne({
      where: { orderSn: orderId } as any,
      relations: ['orderItems'],
    });

    if (!order || !distributionCode) {
      return [];
    }

    // 查找分销员链路
    const distributionChain = await this.getDistributionChain(distributionCode);
    
    if (distributionChain.length === 0) {
      return [];
    }

    const distributionOrders: DistributionOrder[] = [];

    // 为每个订单项创建分销订单记录
    for (const item of order.orderItems) {
      const distributionGoods = await this.distributionGoodsRepository.findOne({
            where: { 
              productId: item.productId,
              status: 'active'
            }
          });

      if (!distributionGoods) {
        continue;
      }

      // 为每个分销层级创建记录
      for (let i = 0; i < distributionChain.length; i++) {
        const distribution = distributionChain[i];
        const level = i + 1;
        
        let commissionAmount = 0;
        let commissionRate = 0;

        // 根据层级获取佣金
        switch (level) {
          case 1:
            commissionRate = distributionGoods.firstCommission;
            break;
          case 2:
            commissionRate = distributionGoods.secondCommission;
            break;
          case 3:
            commissionRate = distributionGoods.thirdCommission;
            break;
        }

        if (commissionRate > 0) {
          commissionAmount = item.price * item.quantity * (commissionRate / 100);
        }

        // 获取上级信息
        const parent = i < distributionChain.length - 1 ? distributionChain[i + 1] : null;
        const grandparent = i < distributionChain.length - 2 ? distributionChain[i + 2] : null;

        const distributionOrder = this.distributionOrderRepository.create({
          orderId: order.orderSn,
          orderSn: order.orderSn,
          distributionId: distribution.id,
          parentDistributionId: parent?.id || null,
          grandParentDistributionId: grandparent?.id || null,
          buyerId: order.memberId,
          orderAmount: order.totalAmount,
          productAmount: item.price * item.quantity,
          firstCommission: level === 1 ? commissionAmount : 0,
          secondCommission: level === 2 ? commissionAmount : 0,
          thirdCommission: level === 3 ? commissionAmount : 0,
          totalCommission: commissionAmount,
          commissionStatus: 'pending',
          commissionRate,
          commissionLevel: level,
        });

        distributionOrders.push(distributionOrder);
      }
    }

    if (distributionOrders.length > 0) {
      await this.distributionOrderRepository.save(distributionOrders);
    }

    return distributionOrders;
  }

  /**
   * 获取分销链路
   */
  private async getDistributionChain(distributionCode: string): Promise<Distribution[]> {
    const chain: Distribution[] = [];
    let currentCode = distributionCode;
    let level = 0;
    const maxLevel = 3; // 最多3级分销

    while (currentCode && level < maxLevel) {
      const distribution = await this.distributionRepository.findOne({
        where: { 
          distributionCode: currentCode,
          status: 'approved'
        }
      });

      if (!distribution) {
        break;
      }

      chain.push(distribution);
      // Get parent's distribution code using parentId
      if (distribution.parentId) {
        const parentDistribution = await this.distributionRepository.findOne({
          where: { id: distribution.parentId, status: 'approved' }
        });
        currentCode = parentDistribution?.distributionCode || null;
      } else {
        currentCode = null;
      }
      level++;
    }

    return chain;
  }

  /**
   * 更新分销订单状态
   */
  async updateDistributionOrderStatus(orderId: string, orderStatus: string, paymentStatus?: string): Promise<void> {
    const updateData: any = { orderStatus };
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    await this.distributionOrderRepository.update(
      { orderId },
      updateData
    );

    // 如果订单完成，结算佣金
    if (orderStatus === '4') { // 订单完成状态
      await this.settleCommission(orderId);
    }
  }

  /**
   * 结算佣金
   */
  private async settleCommission(orderId: string): Promise<void> {
    const distributionOrders = await this.distributionOrderRepository.find({
      where: { 
        orderId,
        commissionStatus: 'pending' // 待结算
      }
    });

    for (const order of distributionOrders) {
      try {
        // 简化实现：直接更新分销员佣金
        await this.distributionRepository.increment(
          { id: order.distributionId },
          'availableCommission',
          order.totalCommission
        );
        await this.distributionRepository.increment(
          { id: order.distributionId },
          'totalCommission',
          order.totalCommission
        );

        // 更新分销订单状态
        order.commissionStatus = 'settled'; // 已结算

        await this.distributionOrderRepository.save(order);
      } catch (error) {
        console.error(`结算佣金失败: orderId=${orderId}, distributionOrderId=${order.id}`, error);
      }
    }
  }

  /**
   * 获取分销订单列表
   */
  async getDistributionOrderList(query: any): Promise<{ items: DistributionOrder[]; total: number }> {
    const { page = 1, limit = 20, distributionId, orderId, distributionCode, status, startTime, endTime, sortBy = 'createTime', sortOrder = 'DESC' } = query;

    const whereCondition: any = {};

    if (distributionId) {
      whereCondition.distributionId = distributionId;
    }
    if (orderId) {
      whereCondition.orderId = orderId;
    }
    // Removed invalid distributionCode filter as it's not a field in DistributionOrder entity
    if (status !== undefined) {
      whereCondition.commissionStatus = status;
    }
    if (startTime && endTime) {
      whereCondition.createTime = Between(new Date(startTime), new Date(endTime));
    }

    const [items, total] = await this.distributionOrderRepository.findAndCount({
      where: whereCondition,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取分销订单详情
   */
  async getDistributionOrderDetail(id: string): Promise<DistributionOrder> {
    const distributionOrder = await this.distributionOrderRepository.findOne({
      where: { id },
      relations: ['distribution'],
    });

    if (!distributionOrder) {
      throw new CustomException(CodeEnum.DISTRIBUTION_ORDER_NOT_FOUND);
    }

    return distributionOrder;
  }

  /**
   * 处理订单退款
   */
  async handleOrderRefund(orderId: string, refundAmount: number): Promise<void> {
    const distributionOrders = await this.distributionOrderRepository.find({
      where: { 
        orderId,
        commissionStatus: 'settled' // 已结算
      }
    });

    for (const order of distributionOrders) {
      try {
        // 计算退款比例
        const refundRatio = refundAmount / order.orderAmount;
        const refundCommission = order.totalCommission * refundRatio;

        // 扣减分销员佣金
        await this.distributionRepository.decrement(
          { id: order.distributionId },
          'availableCommission',
          refundCommission
        );
        await this.distributionRepository.decrement(
          { id: order.distributionId },
          'totalCommission',
          refundCommission
        );

        // 更新分销订单
        order.commissionStatus = 'canceled'; // 已取消

        await this.distributionOrderRepository.save(order);
      } catch (error) {
        console.error(`处理退款失败: orderId=${orderId}, distributionOrderId=${order.id}`, error);
      }
    }
  }
}