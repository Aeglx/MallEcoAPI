import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { PointsOrder, PointsOrderStatus } from '../../../framework/entities/points-order.entity';
import { PointsGoods } from '../../../framework/entities/points-goods.entity';
import { Member } from '../../../framework/entities/member.entity';
import {
  PointsRecord,
  PointsRecordType,
  PointsRecordSource,
} from '../../../framework/entities/points-record.entity';

@Injectable()
export class PointsOrderService {
  constructor(
    @InjectRepository(PointsOrder)
    private readonly pointsOrderRepository: Repository<PointsOrder>,
    @InjectRepository(PointsGoods)
    private readonly pointsGoodsRepository: Repository<PointsGoods>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PointsRecord)
    private readonly pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `PO${timestamp}${random}`;
  }

  /**
   * 获取积分订单列表
   */
  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 10,
      orderNo,
      memberId,
      memberUsername,
      status,
      startTime,
      endTime,
    } = query;

    const skip = (Number(page) - 1) * Number(pageSize);

    const queryBuilder = this.pointsOrderRepository.createQueryBuilder('order');

    if (orderNo) {
      queryBuilder.andWhere('order.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    }
    if (memberId) {
      queryBuilder.andWhere('order.memberId = :memberId', { memberId });
    }
    if (memberUsername) {
      queryBuilder.andWhere('order.memberUsername LIKE :memberUsername', {
        memberUsername: `%${memberUsername}%`,
      });
    }
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    if (startTime && endTime) {
      queryBuilder.andWhere('order.createTime >= :startTime', { startTime: new Date(startTime) });
      queryBuilder.andWhere('order.createTime <= :endTime', { endTime: new Date(endTime) });
    }
    queryBuilder.andWhere('order.deleted = :deleted', { deleted: false });

    try {
      const [result, total] = await queryBuilder
        .skip(skip)
        .take(Number(pageSize))
        .orderBy('order.createTime', 'DESC')
        .getManyAndCount();

      return {
        success: true,
        result,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        message: '获取积分订单列表成功',
      };
    } catch (error) {
      console.error('获取积分订单列表失败:', error);
      return {
        success: false,
        result: [],
        total: 0,
        message: '获取积分订单列表失败: ' + error.message,
      };
    }
  }

  /**
   * 获取积分订单详情
   */
  async findOne(id: string) {
    try {
      const order = await this.pointsOrderRepository.findOne({
        where: { id, deleted: false },
      });

      if (!order) {
        return {
          success: false,
          message: '积分订单不存在',
        };
      }

      return {
        success: true,
        result: order,
        message: '获取积分订单详情成功',
      };
    } catch (error) {
      console.error('获取积分订单详情失败:', error);
      return {
        success: false,
        message: '获取积分订单详情失败: ' + error.message,
      };
    }
  }

  /**
   * 创建积分订单（管理员手动创建或用户兑换）
   */
  async create(orderData: any) {
    try {
      // 验证必填字段
      if (!orderData.memberId) {
        throw new BadRequestException('会员ID不能为空');
      }
      if (!orderData.goodsId) {
        throw new BadRequestException('商品ID不能为空');
      }
      if (!orderData.quantity || orderData.quantity <= 0) {
        throw new BadRequestException('兑换数量必须大于0');
      }

      // 查询商品信息
      const goods = await this.pointsGoodsRepository.findOne({
        where: { id: orderData.goodsId, deleted: false },
      });

      if (!goods) {
        throw new NotFoundException('积分商品不存在');
      }

      if (!goods.isShow) {
        throw new BadRequestException('商品已下架');
      }

      // 检查库存
      if (goods.stock < orderData.quantity) {
        throw new BadRequestException('库存不足');
      }

      // 检查限购
      if (goods.limitBuy > 0 && orderData.quantity > goods.limitBuy) {
        throw new BadRequestException(`限购${goods.limitBuy}件`);
      }

      // 查询会员信息
      const member = await this.memberRepository.findOne({
        where: { id: orderData.memberId, deleted: false },
      });

      if (!member) {
        throw new NotFoundException('会员不存在');
      }

      // 计算所需积分和金额
      const totalPoints = goods.points * orderData.quantity;
      const totalCash = goods.cashAmount ? goods.cashAmount * orderData.quantity : 0;
      const totalAmount = totalCash;

      // 检查会员积分是否足够
      if (member.points < totalPoints) {
        throw new BadRequestException('积分不足');
      }

      // 创建订单
      const orderNo = this.generateOrderNo();
      const newOrder = this.pointsOrderRepository.create({
        orderNo,
        memberId: orderData.memberId,
        memberUsername: member.username || member.nickname,
        goodsId: orderData.goodsId,
        goodsName: goods.goodsName,
        goodsImage: goods.mainImage,
        quantity: orderData.quantity,
        points: totalPoints,
        cashAmount: totalCash,
        totalAmount,
        status: PointsOrderStatus.PENDING,
        consignee: orderData.consignee || '',
        phone: orderData.phone || '',
        province: orderData.province || '',
        city: orderData.city || '',
        district: orderData.district || '',
        detailAddress: orderData.detailAddress || '',
        postalCode: orderData.postalCode || '',
        remark: orderData.remark || '',
      });

      const savedOrder = await this.pointsOrderRepository.save(newOrder);

      // 扣除会员积分
      member.points -= totalPoints;
      await this.memberRepository.save(member);

      // 创建积分消耗记录
      const pointsRecord = this.pointsRecordRepository.create({
        memberId: member.id,
        memberUsername: member.username || member.nickname,
        type: PointsRecordType.CONSUME,
        points: -totalPoints,
        balance: member.points,
        source: PointsRecordSource.EXCHANGE,
        orderNo,
        businessId: goods.id,
        businessDesc: `兑换商品：${goods.goodsName}`,
        remark: orderData.remark || '积分兑换商品',
      });
      await this.pointsRecordRepository.save(pointsRecord);

      // 更新商品库存和销量
      goods.stock -= orderData.quantity;
      goods.sales += orderData.quantity;
      await this.pointsGoodsRepository.save(goods);

      return {
        success: true,
        result: savedOrder,
        message: '创建订单成功',
      };
    } catch (error) {
      console.error('创建积分订单失败:', error);
      return {
        success: false,
        message: error.message || '创建积分订单失败',
      };
    }
  }

  /**
   * 更新订单状态
   */
  async updateStatus(id: string, statusData: any) {
    try {
      const order = await this.pointsOrderRepository.findOne({
        where: { id, deleted: false },
      });

      if (!order) {
        return {
          success: false,
          message: '订单不存在',
        };
      }

      const newStatus = statusData.status as PointsOrderStatus;
      const oldStatus: PointsOrderStatus = order.status;

      // 状态流转验证
      if (oldStatus === PointsOrderStatus.COMPLETED && newStatus !== PointsOrderStatus.COMPLETED) {
        return {
          success: false,
          message: '已完成订单不能修改状态',
        };
      }

      // 如果订单已经是取消状态，且新状态也是取消，允许更新取消原因
      if (oldStatus === PointsOrderStatus.CANCELLED && newStatus !== PointsOrderStatus.CANCELLED) {
        return {
          success: false,
          message: '已取消订单不能修改为其他状态',
        };
      }

      order.status = newStatus;

      // 根据状态更新相应时间
      if (newStatus === PointsOrderStatus.SHIPPED && !order.shipTime) {
        order.shipTime = new Date();
        if (statusData.logisticsCompany) {
          order.logisticsCompany = statusData.logisticsCompany;
        }
        if (statusData.logisticsNo) {
          order.logisticsNo = statusData.logisticsNo;
        }
      }

      if (newStatus === PointsOrderStatus.COMPLETED && !order.completeTime) {
        order.completeTime = new Date();
      }

      if (newStatus === PointsOrderStatus.CANCELLED) {
        order.cancelReason = statusData.cancelReason || '管理员取消';

        // 取消订单需要退还积分（仅当之前不是已取消状态时）
        if (oldStatus !== PointsOrderStatus.CANCELLED && oldStatus !== PointsOrderStatus.REFUNDED) {
          const member = await this.memberRepository.findOne({
            where: { id: order.memberId },
          });

          if (member) {
            member.points += order.points;
            await this.memberRepository.save(member);

            // 创建积分退款记录
            const pointsRecord = this.pointsRecordRepository.create({
              memberId: member.id,
              memberUsername: member.username || member.nickname,
              type: PointsRecordType.REFUND,
              points: order.points,
              balance: member.points,
              source: PointsRecordSource.EXCHANGE,
              orderNo: order.orderNo,
              businessId: order.goodsId,
              businessDesc: `订单取消，退还积分：${order.goodsName}`,
              remark: order.cancelReason || '订单取消',
            });
            await this.pointsRecordRepository.save(pointsRecord);

            // 恢复库存
            const goods = await this.pointsGoodsRepository.findOne({
              where: { id: order.goodsId },
            });
            if (goods) {
              goods.stock += order.quantity;
              goods.sales -= order.quantity;
              await this.pointsGoodsRepository.save(goods);
            }
          }
        }
      }

      const updatedOrder = await this.pointsOrderRepository.save(order);

      return {
        success: true,
        result: updatedOrder,
        message: '更新订单状态成功',
      };
    } catch (error) {
      console.error('更新订单状态失败:', error);
      return {
        success: false,
        message: '更新订单状态失败: ' + error.message,
      };
    }
  }

  /**
   * 删除订单（软删除）
   */
  async remove(id: string) {
    try {
      const order = await this.pointsOrderRepository.findOne({
        where: { id, deleted: false },
      });

      if (!order) {
        return {
          success: false,
          message: '订单不存在',
        };
      }

      order.deleted = true;
      await this.pointsOrderRepository.save(order);

      return {
        success: true,
        message: '删除订单成功',
      };
    } catch (error) {
      console.error('删除订单失败:', error);
      return {
        success: false,
        message: '删除订单失败: ' + error.message,
      };
    }
  }

  /**
   * 获取订单统计
   */
  async getStatistics(query: any) {
    try {
      const { startTime, endTime } = query;

      const queryBuilder = this.pointsOrderRepository.createQueryBuilder('order');
      queryBuilder.andWhere('order.deleted = :deleted', { deleted: false });

      if (startTime && endTime) {
        queryBuilder.andWhere('order.createTime >= :startTime', { startTime: new Date(startTime) });
        queryBuilder.andWhere('order.createTime <= :endTime', { endTime: new Date(endTime) });
      }

      const allOrders = await queryBuilder.getMany();

      const statistics = {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === PointsOrderStatus.PENDING).length,
        shippedOrders: allOrders.filter(o => o.status === PointsOrderStatus.SHIPPED).length,
        completedOrders: allOrders.filter(o => o.status === PointsOrderStatus.COMPLETED).length,
        cancelledOrders: allOrders.filter(o => o.status === PointsOrderStatus.CANCELLED).length,
        totalPoints: allOrders.reduce((sum, o) => sum + o.points, 0),
        totalCash: allOrders.reduce((sum, o) => sum + Number(o.cashAmount), 0),
        totalAmount: allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      };

      return {
        success: true,
        result: statistics,
        message: '获取统计信息成功',
      };
    } catch (error) {
      console.error('获取订单统计失败:', error);
      return {
        success: false,
        message: '获取订单统计失败: ' + error.message,
      };
    }
  }
}
