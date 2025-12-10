import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { BrandController } from './controllers/brand.controller';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { BrandService } from './services/brand.service';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from './entities/category.entity';
import { BrandEntity } from './entities/brand.entity';
import { ProductSkuEntity } from './entities/product-sku.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { ProductReviewEntity } from './entities/product-review.entity';
import { ProductInventoryEntity } from './entities/product-inventory.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      BrandEntity,
      ProductSkuEntity,
      ProductAttributeEntity,
      ProductReviewEntity,
      ProductInventoryEntity,
    ]),
    ConfigModule,
    AuthModule,
  ],
  controllers: [
    ProductController,
    CategoryController,
    BrandController,
  ],
  providers: [
    ProductService,
    CategoryService,
    BrandService,
  ],
  exports: [
    ProductService,
    CategoryService,
    BrandService,
  ],
})
export class ProductModule {}