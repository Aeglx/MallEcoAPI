import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CouponService } from '../services/coupon.service';
import { CouponEntity } from '../entities/coupon.entity';

@ApiTags('优惠券管理')
@Controller('promotion/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiOperation({ summary: '创建优惠券' })
  @ApiResponse({ status: 201, description: '优惠券创建成功', type: CouponEntity })
  async createCoupon(@Body() couponData: {
    couponName: string;
    couponType: string;
    couponPrice: number;
    couponThreshold: number;
    couponStock: number;
    perLimit: number;
    startTime: string;
    endTime: string;
    publishNum: number;
    receiveType: string;
    goodsScopeType: string;
    goodsScopeIds?: string[];
    storeIds?: string[];
    memberLevel?: string;
    remark?: string;
  }) {
    return await this.couponService.createCoupon(couponData);
  }

  @Get()
  @ApiOperation({ summary: '获取优惠券列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'couponType', required: false, description: '优惠券类型' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  async getCouponList(@Query() params: {
    page?: number;
    pageSize?: number;
    couponType?: string;
    status?: string;
  }) {
    return await this.couponService.getCouponList(params);
  }

  @Get(':couponId')
  @ApiOperation({ summary: '获取优惠券详情' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: CouponEntity })
  async getCouponById(@Param('couponId') couponId: string) {
    return await this.couponService.getCouponById(couponId);
  }

  @Put(':couponId')
  @ApiOperation({ summary: '更新优惠券' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: CouponEntity })
  async updateCoupon(@Param('couponId') couponId: string, @Body() updateData: Partial<CouponEntity>) {
    return await this.couponService.updateCoupon(couponId, updateData);
  }

  @Delete(':couponId')
  @ApiOperation({ summary: '删除优惠券' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteCoupon(@Param('couponId') couponId: string) {
    return await this.couponService.deleteCoupon(couponId);
  }

  @Post(':couponId/publish')
  @ApiOperation({ summary: '发布优惠券' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '发布成功' })
  async publishCoupon(@Param('couponId') couponId: string) {
    return await this.couponService.publishCoupon(couponId);
  }

  @Post(':couponId/close')
  @ApiOperation({ summary: '关闭优惠券' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '关闭成功' })
  async closeCoupon(@Param('couponId') couponId: string) {
    return await this.couponService.closeCoupon(couponId);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '获取用户优惠券列表' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiQuery({ name: 'status', required: false, description: '优惠券状态' })
  async getMemberCoupons(
    @Param('memberId') memberId: string,
    @Query('status') status?: string
  ) {
    return await this.couponService.getMemberCoupons(memberId, status);
  }

  @Post('member/:memberId/receive/:couponId')
  @ApiOperation({ summary: '用户领取优惠券' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '领取成功' })
  async receiveCoupon(
    @Param('memberId') memberId: string,
    @Param('couponId') couponId: string
  ) {
    return await this.couponService.receiveCoupon(memberId, couponId);
  }

  @Post('member/:memberId/use/:couponId')
  @ApiOperation({ summary: '使用优惠券' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '使用成功' })
  async useCoupon(
    @Param('memberId') memberId: string,
    @Param('couponId') couponId: string,
    @Body() data: { orderId: string; orderAmount: number }
  ) {
    return await this.couponService.useCoupon(memberId, couponId, data);
  }

  @Get('statistics/:couponId')
  @ApiOperation({ summary: '获取优惠券统计' })
  @ApiParam({ name: 'couponId', description: '优惠券ID' })
  async getCouponStatistics(@Param('couponId') couponId: string) {
    return await this.couponService.getCouponStatistics(couponId);
  }
}