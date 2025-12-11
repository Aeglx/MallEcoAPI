import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { PromotionService } from './promotion.service';
import { CouponEntity } from '../coupon/entities/coupon.entity';
import { CouponUserEntity } from '../coupon/entities/coupon-user.entity';
import { FlashSaleEntity } from '../coupon/entities/flash-sale.entity';
import { GroupBuyingEntity } from '../coupon/entities/group-buying.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponUserEntity,
      FlashSaleEntity,
      GroupBuyingEntity,
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService, PromotionService],
  exports: [CouponService, PromotionService],
})
export class PromotionModule {}