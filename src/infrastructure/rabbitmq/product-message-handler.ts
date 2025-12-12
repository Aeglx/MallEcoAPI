import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ProductsService } from '../products/products.service';

@Controller()
export class ProductMessageHandler {
  constructor(private readonly productsService: ProductsService) {}

  @EventPattern('product.created')
  async handleProductCreated(@Payload() data: any) {
    console.log('Received product.created event:', data);
    // 可以在这里执行一些额外的逻辑，比如发送通知、更新缓存等
  }

  @EventPattern('product.updated')
  async handleProductUpdated(@Payload() data: any) {
    console.log('Received product.updated event:', data);
    // 可以在这里执行一些额外的逻辑，比如发送通知、更新缓存等
  }

  @EventPattern('product.deleted')
  async handleProductDeleted(@Payload() data: any) {
    console.log('Received product.deleted event:', data);
    // 可以在这里执行一些额外的逻辑，比如发送通知、清理缓存等
  }
}
