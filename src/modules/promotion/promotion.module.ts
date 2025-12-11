import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from './controllers/coupon.controller';
import { SeckillController } from './controllers/seckill.controller';
import { GroupBuyController } from './controllers/groupbuy.controller';
import { CouponService } from './services/coupon.service';
import { SeckillService } from './services/seckill.service';
import { GroupBuyService } from './services/groupbuy.service';
import { CouponEntity } from './entities/coupon.entity';
import { SeckillEntity } from './entities/seckill.entity';
import { GroupBuyEntity } from './entities/groupbuy.entity';
import { CouponLogEntity } from './entities/coupon-log.entity';
import { SeckillOrderEntity } from './entities/seckill-order.entity';
import { GroupTeamEntity } from './entities/group-team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      SeckillEntity,
      GroupBuyEntity,
      CouponLogEntity,
      SeckillOrderEntity,
      GroupTeamEntity,
    ]),
  ],
  controllers: [CouponController, SeckillController, GroupBuyController],
  providers: [CouponService, SeckillService, GroupBuyService],
  exports: [CouponService, SeckillService, GroupBuyService],
})
export class PromotionModule {}