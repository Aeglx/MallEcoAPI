import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../../modules/common/order/entities/order.entity';
import { OrderItem } from '../../../modules/common/order/entities/order-item.entity';
import { OrderLog } from '../../../modules/common/order/entities/order-log.entity';
import { ProductSku } from '../../../modules/common/product/entities/product-sku.entity';
import { PaymentModule } from '../../common/payment/payment.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderLog, ProductSku]),
    PaymentModule,
    CartModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
