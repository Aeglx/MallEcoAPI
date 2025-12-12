import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderLog } from './entities/order-log.entity';
import { OrderShardingService } from './sharding/order.sharding.service';
import { ShardingModule } from '../sharding/sharding.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderLog]),
    ShardingModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderShardingService],
  exports: [OrderService, OrderShardingService],
})
export class OrderModule {}
