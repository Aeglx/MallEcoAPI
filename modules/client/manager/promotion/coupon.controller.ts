import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Query, 
  Param,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CouponService } from '../../common/promotion/services/coupon.service';
import { CouponCreateDto } from '../../common/promotion/dto/coupon-create.dto';
import { CouponQueryDto } from '../../common/promotion/dto/coupon-query.dto';
import { ResponseModel, PaginationResponse } from '../../common/interfaces/response.interface';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('管理-优惠券')
@Controller('manager/coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  @ApiOperation({ summary: '创建优惠券' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createCoupon(
    @Body() createDto: CouponCreateDto,
    @Request() req: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.couponService.createCoupon(createDto, req.user.id);
    return {
      code: 200,
      message: '创建成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('list')
  @ApiOperation({ summary: '获取优惠券列表' })
  @ApiQuery({ name: 'name', description: '优惠券名称', required: false })
  @ApiQuery({ name: 'code', description: '优惠券编码', required: false })
  @ApiQuery({ name: 'type', description: '优惠券类型', required: false })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCoupons(@Query() queryDto: CouponQueryDto): Promise<ResponseModel<any>> {
    const result = await this.couponService.getCoupons(queryDto);
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

  @Put('update/:id')
  @ApiOperation({ summary: '更新优惠券' })
  @ApiParam({ name: 'id', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateDto: Partial<CouponCreateDto>,
    @Request() req: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.couponService.updateCoupon(id, updateDto, req.user.id);
    return {
      code: 200,
      message: '更新成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除优惠券' })
  @ApiParam({ name: 'id', description: '优惠券ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteCoupon(@Param('id') id: string): Promise<ResponseModel<any>> {
    await this.couponService.deleteCoupon(id);
    return {
      code: 200,
      message: '删除成功',
      data: null,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('member/list')
  @ApiOperation({ summary: '获取会员优惠券列表' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'couponId', description: '优惠券ID', required: false })
  @ApiQuery({ name: 'status', description: '使用状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCouponMembers(@Query() queryDto: any): Promise<ResponseModel<any>> {
    const result = await this.couponService.getMyCoupons(queryDto);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('grant')
  @ApiOperation({ summary: '系统发放优惠券' })
  @ApiResponse({ status: 200, description: '发放成功' })
  async grantCoupon(
    @Body() body: { couponId: string; memberIds: string[] },
  ): Promise<ResponseModel<any>> {
    const result = await this.couponService.grantCoupon(body.couponId, body.memberIds);
    return {
      code: 200,
      message: '发放成功',
      data: { successCount: result },
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取优惠券统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCouponStatistics(): Promise<ResponseModel<any>> {
    // 这里应该实现统计逻辑
    // 简化实现，实际应该查询数据库统计
    const statistics = {
      totalCount: 0,
      receivedCount: 0,
      usedCount: 0,
      expiredCount: 0,
      totalDiscount: 0,
    };

    return {
      code: 200,
      message: '获取成功',
      data: statistics,
      timestamp: Date.now(),
      traceId: '',
    };
  }
}