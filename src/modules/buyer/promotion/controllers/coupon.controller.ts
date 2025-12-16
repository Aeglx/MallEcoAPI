import { Controller, Get } from '@nestjs/common';
import { CouponService } from '../services/coupon.service';

@Controller('buyer/promotion/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('activity')
  getAutoCoupon() {
    return this.couponService.getAutoCouponActivity();
  }
}
