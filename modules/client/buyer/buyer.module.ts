import { Module } from '@nestjs/common';
import { AuthModule } from '../common/auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { BuyerLiveModule } from './live/live.module';
import { BuyerContentModule } from './content/content.module';
import { WalletModule } from './wallet/wallet.module';
import { PromotionModule } from './promotion/promotion.module';
// 暂时注释掉distribution模块导入，因为该模块似乎不存在
// import { DistributionModule } from './distribution/distribution.module';

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
    // DistributionModule, // 暂时注释掉，因为该模块似乎不存在
  ],
  exports: [OrderModule, WalletModule, PromotionModule],
})
export class BuyerModule {}
