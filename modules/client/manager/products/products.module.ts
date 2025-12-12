import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../common/product/entities/product.entity';
import { ManagerProductsController } from './products.controller';
import { ManagerProductsService } from './products.service';
import { RabbitMQModule } from '../../../../src/infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    RabbitMQModule
  ],
  controllers: [ManagerProductsController],
  providers: [ManagerProductsService],
  exports: [ManagerProductsService]
})
export class ManagerProductsModule {}
