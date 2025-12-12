import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { ProductSku } from '../../common/product/entities/product-sku.entity';
import { Product } from '../../common/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, ProductSku, Product])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
