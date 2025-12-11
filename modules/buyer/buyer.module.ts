import { Module } from '@nestjs/common';
import { AuthModule } from '../common/auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { BuyerLiveModule } from './live/live.module';
import { BuyerContentModule } from './content/content.module';
import { WalletModule } from './wallet/wallet.module';
import { PromotionModule } from './promotion/promotion.module';
import { DistributionModule } from './distribution/distribution.module';

@Module({
  imports: [
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
    BuyerLiveModule,
    BuyerContentModule,
    WalletModule,
    PromotionModule,
    DistributionModule,
  ],
  exports: [OrderModule, WalletModule, PromotionModule],
})
export class BuyerModule {}
