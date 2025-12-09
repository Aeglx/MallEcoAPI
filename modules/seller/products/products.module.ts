import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../common/product/entities/product.entity';
import { ProductSku } from '../../common/product/entities/product-sku.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { RabbitMQModule } from '../../../src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductSku]),
    RabbitMQModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
