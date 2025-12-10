import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 实体
import { Coupon } from './entities/coupon.entity';
import { CouponMember } from './entities/coupon-member.entity';
import { FullDiscount, FullDiscountRule } from './entities/full-discount.entity';
import { Seckill, SeckillGoods } from './entities/seckill.entity';
import { GroupBuy, GroupBuyGoods, GroupBuyOrder } from './entities/group-buy.entity';
import { Promotion, PromotionParticipant } from './entities/promotion.entity';

// 服务
import { CouponService } from './services/coupon.service';
import { FullDiscountService } from './services/full-discount.service';
import { SeckillService } from './services/seckill.service';
import { GroupBuyService } from './services/group-buy.service';
import { PromotionService } from './services/promotion.service';

// 其他依赖
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 优惠券相关
      Coupon,
      CouponMember,
      // 满减活动相关
      FullDiscount,
      FullDiscountRule,
      // 秒杀活动相关
      Seckill,
      SeckillGoods,
      // 拼团活动相关
      GroupBuy,
      GroupBuyGoods,
      GroupBuyOrder,
      // 营销活动相关
      Promotion,
      PromotionParticipant,
    ]),
    MemberModule,
  ],
  providers: [
    // 服务
    CouponService,
    FullDiscountService,
    SeckillService,
    GroupBuyService,
    PromotionService,
  ],
  exports: [
    // 导出服务供其他模块使用
    CouponService,
    FullDiscountService,
    SeckillService,
    GroupBuyService,
    PromotionService,
  ],
})
export class PromotionModule {}