import { Module } from '@nestjs/common';
import { AuthModule } from '../common/auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { BuyerLiveModule } from './live/live.module';

@Module({
  imports: [
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
    BuyerLiveModule,
  ],
  exports: [OrderModule],
})
export class BuyerModule {}
