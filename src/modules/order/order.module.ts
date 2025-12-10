import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './controllers/order.controller';
import { CartController } from './controllers/cart.controller';
import { OrderService } from './services/order.service';
import { CartService } from './services/cart.service';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CartEntity } from './entities/cart.entity';
import { OrderLogEntity } from './entities/order-log.entity';
import { OrderStatusEntity } from './entities/order-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      CartEntity,
      OrderLogEntity,
      OrderStatusEntity,
    ]),
  ],
  controllers: [OrderController, CartController],
  providers: [OrderService, CartService],
  exports: [OrderService, CartService],
})
export class OrderModule {}