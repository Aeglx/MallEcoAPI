import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { StatisticsModule } from '../../src/statistics/statistics.module';
import { TaskService } from './services/task.service';
import { OrderTaskService } from './services/order-task.service';
import { ProductTaskService } from './services/product-task.service';
import { ExecutorService } from './services/executor.service';
import { XxlJobController } from './xxljob.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../modules/client/common/order/entities/order.entity';
import { Product } from '../../modules/client/common/product/entities/product.entity';
import xxljobConfig from './xxljob.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forFeature(xxljobConfig),
    StatisticsModule,
    TypeOrmModule.forFeature([Order, Product]),
  ],
  controllers: [
    XxlJobController,
  ],
  providers: [
    TaskService,
    OrderTaskService,
    ProductTaskService,
    ExecutorService,
  ],
  exports: [
    TaskService,
    OrderTaskService,
    ProductTaskService,
    ExecutorService,
  ],
})
export class XxlJobModule {}

