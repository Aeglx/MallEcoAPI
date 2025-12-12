import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Order } from '../../../modules/client/common/order/entities/order.entity';
import { OrderStatus, PayStatus } from '../../../modules/client/common/order/enum/order-status.enum';

@Injectable()
export class OrderTaskService {
  private readonly logger = new Logger(OrderTaskService.name);

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {}

  /**
   * �?0分钟检查一次，取消超时未支付的订单
   */
  @Cron('0 */10 * * * *')
  async cancelTimeoutUnpaidOrders() {
    this.logger.debug('开始检查超时未支付的订�?);
    try {
      // 查找30分钟前创建的未支付订�?
      const timeoutDate = new Date();
      timeoutDate.setMinutes(timeoutDate.getMinutes() - 30);

      const ordersToCancel = await this.orderRepository.find({
        where: {
          orderStatus: OrderStatus.UNPAID,
          payStatus: PayStatus.UNPAID,
          createTime: LessThan(timeoutDate),
        },
      });

      if (ordersToCancel.length > 0) {
        // 批量更新订单状态为已取�?
        await this.orderRepository.update(
          { id: In(ordersToCancel.map(order => order.id)) },
          { orderStatus: OrderStatus.CANCELLED },
        );

        this.logger.debug(`成功取消 ${ordersToCancel.length} 个超时未支付的订单`);
      } else {
        this.logger.debug('没有发现超时未支付的订单');
      }
    } catch (error) {
      this.logger.error('取消超时未支付订单失�?, error.stack);
    }
  }

  /**
   * 每天凌晨2点自动确认收货（发货�?天）
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async autoConfirmReceivedOrders() {
    this.logger.debug('开始自动确认收�?);
    try {
      // 查找7天前发货的订�?
      const confirmDate = new Date();
      confirmDate.setDate(confirmDate.getDate() - 7);

      const ordersToConfirm = await this.orderRepository.find({
        where: {
          orderStatus: OrderStatus.DELIVERED,
          shipTime: LessThan(confirmDate),
        },
      });

      if (ordersToConfirm.length > 0) {
        // 批量更新订单状态为已完�?
        await this.orderRepository.update(
          { id: In(ordersToConfirm.map(order => order.id)) },
          { orderStatus: OrderStatus.COMPLETED },
        );

        this.logger.debug(`成功自动确认收货 ${ordersToConfirm.length} 个订单`);
      } else {
        this.logger.debug('没有需要自动确认收货的订单');
      }
    } catch (error) {
      this.logger.error('自动确认收货失败', error.stack);
    }
  }

  /**
   * 每天凌晨3点生成订单统计报�?
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async generateOrderStatisticsReport() {
    this.logger.debug('开始生成订单统计报�?);
    try {
      // 这里可以实现订单统计报表的生成逻辑
      // 例如：统计前一天的订单总量、销售额、订单状态分布等
      this.logger.debug('订单统计报表生成完成');
    } catch (error) {
      this.logger.error('生成订单统计报表失败', error.stack);
    }
  }
}

