import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../common/product/entities/product.entity';
import { ProductSku } from '../../common/product/entities/product-sku.entity';
import { Category } from '../../common/product/entities/category.entity';
import { Brand } from '../../common/product/entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSku, Category, Brand])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

