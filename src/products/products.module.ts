import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
// import { Product } from './entities/product.entity';
import { ProductMessageHandler } from '../rabbitmq/product-message-handler';

@Module({
  imports: [],
  controllers: [ProductsController],
  providers: [ProductsService, ProductMessageHandler],
  exports: [],
})
export class ProductsModule {}
