import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from '../../modules/buyer/order/order.service';
import { MemberMessageService } from '../../modules/service/message/services/member-message.service';

@Controller()
export class OrderMessageHandler {
  constructor(
    private readonly orderService: OrderService,
    private readonly memberMessageService: MemberMessageService
  ) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() order: any) {
    console.log('Received order.created event:', order);
    
    // 发送订单创建成功消息给用户
    await this.memberMessageService.createMessage({
      memberId: order.userId,
      title: '订单创建成功',
      content: `您的订单�?${order.id} 已创建成功，请及时付款`,
      messageType: 'order'
    });
  }

  @EventPattern('order.paid')
  async handleOrderPaid(@Payload() order: any) {
    console.log('Received order.paid event:', order);
    
    // 发送订单支付成功消息给用户
    await this.memberMessageService.createMessage({
      memberId: order.userId,
      title: '订单支付成功',
      content: `您的订单�?${order.id} 已支付成功，我们将尽快为您发货`,
      messageType: 'order'
    });
  }

  @EventPattern('order.shipped')
  async handleOrderShipped(@Payload() order: any) {
    console.log('Received order.shipped event:', order);
    
    // 发送订单发货消息给用户
    await this.memberMessageService.createMessage({
      memberId: order.userId,
      title: '订单已发�?,
      content: `您的订单�?${order.id} 已发货，请注意查收`,
      messageType: 'order'
    });
  }

  @EventPattern('order.completed')
  async handleOrderCompleted(@Payload() order: any) {
    console.log('Received order.completed event:', order);
    
    // 发送订单完成消息给用户
    await this.memberMessageService.createMessage({
      memberId: order.userId,
      title: '订单已完�?,
      content: `您的订单�?${order.id} 已完成，感谢您的购买`,
      messageType: 'order'
    });
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() order: any) {
    console.log('Received order.cancelled event:', order);
    
    // 发送订单取消消息给用户
    await this.memberMessageService.createMessage({
      memberId: order.userId,
      title: '订单已取�?,
      content: `您的订单�?${order.id} 已取消`,
      messageType: 'order'
    });
  }
}

