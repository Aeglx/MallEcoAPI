import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { StoreModule } from './store/store.module';
import { SellerContentModule } from './content/content.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    ProductsModule,
    OrdersModule,
    StoreModule,
    SellerContentModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class SellerModule {}
