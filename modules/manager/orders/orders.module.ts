import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/order/entities/order.entity';
import { OrderItem } from '../../common/order/entities/order-item.entity';
import { OrderLog } from '../../common/order/entities/order-log.entity';
import { ManagerOrdersController } from './orders.controller';
import { ManagerOrdersService } from './orders.service';
import { RabbitMQModule } from '../../../src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderLog]),
    RabbitMQModule,
  ],
  controllers: [ManagerOrdersController],
  providers: [ManagerOrdersService],
  exports: [ManagerOrdersService],
})
export class ManagerOrdersModule {}
