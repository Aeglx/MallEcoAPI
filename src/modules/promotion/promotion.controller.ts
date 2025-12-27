import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import { Coupon } from './entities/coupon.entity';
import { Activity } from './entities/activity.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('促销营销')
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  // 优惠券相关接口
  @Post('coupons')
  @ApiOperation({ summary: '创建优惠券' })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功', type: Coupon })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async createCoupon(
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<{ success: boolean; data: Coupon; message: string }> {
    const coupon = await this.promotionService.createCoupon(createCouponDto);
    return {
      success: true,
      data: coupon,
      message: '创建优惠券成功',
    };
  }

  @Get('coupons')
  @ApiOperation({ summary: '获取优惠券列表' })
  @ApiQuery({ name: 'page', description: '页码', example: 1, required: false, type: Number })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: '状态：0-未发布，1-进行中，2-已结束',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功' })
  async getCoupons(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('status') status?: number,
  ): Promise<{ success: boolean; data: { items: Coupon[]; total: number }; message: string }> {
    const result = await this.promotionService.getCoupons(page, pageSize, status);
    return {
      success: true,
      data: result,
      message: '获取优惠券列表成功',
    };
  }

  @Get('coupons/:id')
  @ApiOperation({ summary: '获取优惠券详情' })
  @ApiParam({ name: 'id', description: '优惠券ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: Coupon })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '优惠券不存在' })
  async getCouponById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: Coupon; message: string }> {
    const coupon = await this.promotionService.getCouponById(id);
    return {
      success: true,
      data: coupon,
      message: '获取优惠券详情成功',
    };
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: '更新优惠券' })
  @ApiParam({ name: 'id', description: '优惠券ID', example: '1' })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功', type: Coupon })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '优惠券不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<{ success: boolean; data: Coupon; message: string }> {
    const updatedCoupon = await this.promotionService.updateCoupon(id, updateCouponDto);
    return {
      success: true,
      data: updatedCoupon,
      message: '更新优惠券成功',
    };
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: '删除优惠券' })
  @ApiParam({ name: 'id', description: '优惠券ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '优惠券不存在' })
  async deleteCoupon(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.promotionService.deleteCoupon(id);
    return {
      success: true,
      message: '删除优惠券成功',
    };
  }

  // 活动相关接口
  @Post('activities')
  @ApiOperation({ summary: '创建活动' })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功', type: Activity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async createActivity(
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<{ success: boolean; data: Activity; message: string }> {
    const activity = await this.promotionService.createActivity(createActivityDto);
    return {
      success: true,
      data: activity,
      message: '创建活动成功',
    };
  }

  @Get('activities')
  @ApiOperation({ summary: '获取活动列表' })
  @ApiQuery({ name: 'page', description: '页码', example: 1, required: false, type: Number })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: '状态：0-未发布，1-进行中，2-已结束',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功' })
  async getActivities(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('status') status?: number,
  ): Promise<{ success: boolean; data: { items: Activity[]; total: number }; message: string }> {
    const result = await this.promotionService.getActivities(page, pageSize, status);
    return {
      success: true,
      data: result,
      message: '获取活动列表成功',
    };
  }

  @Get('activities/:id')
  @ApiOperation({ summary: '获取活动详情' })
  @ApiParam({ name: 'id', description: '活动ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: Activity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  async getActivityById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: Activity; message: string }> {
    const activity = await this.promotionService.getActivityById(id);
    return {
      success: true,
      data: activity,
      message: '获取活动详情成功',
    };
  }

  @Put('activities/:id')
  @ApiOperation({ summary: '更新活动' })
  @ApiParam({ name: 'id', description: '活动ID', example: '1' })
  @ApiBody({ type: UpdateActivityDto })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功', type: Activity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async updateActivity(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<{ success: boolean; data: Activity; message: string }> {
    const updatedActivity = await this.promotionService.updateActivity(id, updateActivityDto);
    return {
      success: true,
      data: updatedActivity,
      message: '更新活动成功',
    };
  }

  @Delete('activities/:id')
  @ApiOperation({ summary: '删除活动' })
  @ApiParam({ name: 'id', description: '活动ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  async deleteActivity(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.promotionService.deleteActivity(id);
    return {
      success: true,
      message: '删除活动成功',
    };
  }
}
