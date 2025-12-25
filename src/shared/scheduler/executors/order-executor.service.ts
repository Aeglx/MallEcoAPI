import { Injectable, Logger } from '@nestjs/common';
import { DelayTaskExecutor } from '../interfaces/executor.interface';
import { TimeTriggerMsg } from '../interfaces/time-trigger.interface';

/**
 * 订单任务执行器示例
 * 用于演示如何使用分布式定时任务
 */
@Injectable()
export class OrderExecutorService implements DelayTaskExecutor {
  readonly executorName = 'ORDER_AUTO_CANCEL';
  private readonly logger = new Logger(OrderExecutorService.name);

  /**
   * 执行订单自动取消任务
   */
  async execute(msg: TimeTriggerMsg): Promise<void> {
    const { orderId } = msg.param;

    this.logger.log(`Executing order auto cancel for order: ${orderId}`);

    try {
      // 这里实现订单自动取消逻辑
      // 例如：检查订单状态，如果未支付则取消订单
      // await this.orderService.cancelOrderIfUnpaid(orderId);
      
      this.logger.log(`Order auto cancel completed: ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  }
}

