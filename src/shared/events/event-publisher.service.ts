import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * 事件发布服务
 * 参考：MallEcoPro/src/shared/events/event-publisher.service.ts
 */
@Injectable()
export class EventPublisherService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * 发布事件
   */
  async publish(eventName: string, payload: any): Promise<void> {
    this.eventEmitter.emit(eventName, payload);
  }

  /**
   * 发布事务提交后事件
   * 注意：需要在事务提交后手动调用
   */
  async publishAfterTransactionCommit(eventName: string, payload: any): Promise<void> {
    // 这里可以扩展为在事务提交后自动发布
    // 目前先直接发布，后续可以集成事务管理器
    this.eventEmitter.emit(`transaction.commit.${eventName}`, payload);
  }

  /**
   * 发布订单相关事件
   */
  async publishOrderEvent(eventType: string, orderData: any): Promise<void> {
    this.eventEmitter.emit(`order.${eventType}`, orderData);
  }

  /**
   * 发布用户相关事件
   */
  async publishUserEvent(eventType: string, userData: any): Promise<void> {
    this.eventEmitter.emit(`user.${eventType}`, userData);
  }

  /**
   * 发布商品相关事件
   */
  async publishGoodsEvent(eventType: string, goodsData: any): Promise<void> {
    this.eventEmitter.emit(`goods.${eventType}`, goodsData);
  }
}

