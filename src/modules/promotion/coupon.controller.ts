import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('优惠券')
@Controller('buyer/promotion/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // 获取自动发券活动
  @Get('activity')
  async getAutoCoup() {
    return this.couponService.getAutoCoupon();
  }
}
