import { Controller, Get, Post, Param, Delete } from '@nestjs/common';

@Controller('buyer/promotion/coupon')
export class CouponController {
  @Get()
  findAll() {
    // 获取优惠券列表
    return { message: '获取优惠券列表' };
  }

  @Get('available')
  findAvailable() {
    // 获取可用优惠券
    return { message: '获取可用优惠券' };
  }

  @Get('received')
  findReceived() {
    // 获取已领取优惠券
    return { message: '获取已领取优惠券' };
  }

  @Post(':id/receive')
  receiveCoupon(@Param('id') id: string) {
    // 领取优惠券
    return { message: `领取优惠券 ${id}` };
  }

  @Delete(':id')
  deleteCoupon(@Param('id') id: string) {
    // 删除优惠券（用户主动删除）
    return { message: `删除优惠券 ${id}` };
  }
}
