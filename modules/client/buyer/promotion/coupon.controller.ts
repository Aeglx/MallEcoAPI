import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CouponService } from '../../common/promotion/services/coupon.service';
import { CouponSearchDto, CouponMemberQueryDto } from '../../common/promotion/dto/coupon-query.dto';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { ResponseModel } from '../../common/interfaces/response.interface';

@ApiTags('买家-优惠券')
@Controller('buyer/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('list')
  @ApiOperation({ summary: '获取可领取的优惠券列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAvailableCoupons(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const searchDto: CouponSearchDto = {
      page,
      limit,
      name: '',
      type: '',
      status: '',
    };
    const result = await this.couponService.getCoupons(searchDto);

    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('receive/:couponId')
  @ApiOperation({ summary: '领取优惠券' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '领取成功' })
  async receiveCoupon(
    @Param('couponId') couponId: string,
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.couponService.receiveCoupon(couponId, user.id);
    return {
      code: 200,
      message: '领取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的优惠券' })
  @ApiQuery({ name: 'status', description: '使用状态 0-未使用 1-已使用 2-已过期', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyCoupons(
    @Query() queryDto: CouponMemberQueryDto,
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.couponService.getMyCoupons({
      ...queryDto,
      memberId: user.id,
    });

    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '获取优惠券详情' })
  @ApiParam({ name: 'id', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCouponDetail(@Param('id') id: string): Promise<ResponseModel<any>> {
    const result = await this.couponService.getCouponDetail(id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('calculate')
  @ApiOperation({ summary: '计算优惠券优惠金额' })
  @ApiResponse({ status: 200, description: '计算成功' })
  async calculateDiscount(
    @Body() body: { couponId: string; orderAmount: number; productIds?: string[] },
  ): Promise<ResponseModel<any>> {
    const discountAmount = await this.couponService.calculateCouponDiscount(
      body.couponId,
      body.orderAmount,
      body.productIds,
    );

    return {
      code: 200,
      message: '计算成功',
      data: { discountAmount },
      timestamp: Date.now(),
      traceId: '',
    };
  }
}