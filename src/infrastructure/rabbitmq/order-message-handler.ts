import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
// import { OrderService } from '../../../modules/order/services/order.service';

@Controller()
export class OrderMessageHandler {
  // 暂时注释掉orderService依赖，因为order模块不存在
  // constructor(
  //   private readonly orderService: OrderService
  // ) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() order: any) {
    console.log('Received order.created event:', order);
  }

  @EventPattern('order.paid')
  async handleOrderPaid(@Payload() order: any) {
    console.log('Received order.paid event:', order);
  }

  @EventPattern('order.shipped')
  async handleOrderShipped(@Payload() order: any) {
    console.log('Received order.shipped event:', order);
  }

  @EventPattern('order.completed')
  async handleOrderCompleted(@Payload() order: any) {
    console.log('Received order.completed event:', order);
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() order: any) {
    console.log('Received order.cancelled event:', order);
  }
}
