import { Controller, Get } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('buyer/promotion/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // 获取自动发券活动
  @Get('activity')
  async getAutoCoup() {
    return this.couponService.getAutoCoupon();
  }
}