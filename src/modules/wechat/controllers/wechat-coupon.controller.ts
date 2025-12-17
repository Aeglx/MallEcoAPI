import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatCouponService } from '../services/wechat-coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { CreateCouponTemplateDto } from '../dto/create-coupon-template.dto';
import { UpdateCouponTemplateDto } from '../dto/update-coupon-template.dto';
import { QueryCouponTemplateDto } from '../dto/query-coupon-template.dto';
import { QueryCouponRecordDto } from '../dto/query-coupon-record.dto';

@ApiTags('公众号管理-微信卡券')
@Controller('admin/wechat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatCouponController {
  constructor(private readonly wechatCouponService: WechatCouponService) {}

  // 卡券管理
  @Get('coupons')
  @ApiOperation({ summary: '获取卡券列表' })
  @ApiResponse({ status: 200, description: '获取卡券列表成功' })
  getCouponList(@Query() queryDto: QueryCouponDto) {
    return this.wechatCouponService.getCouponList(queryDto);
  }

  @Get('coupons/:id')
  @ApiOperation({ summary: '获取卡券详情' })
  @ApiParam({ name: 'id', description: '卡券ID' })
  @ApiResponse({ status: 200, description: '获取卡券详情成功' })
  getCouponById(@Param('id', ParseIntPipe) id: number) {
    return this.wechatCouponService.getCouponById(id);
  }

  @Post('coupons')
  @ApiOperation({ summary: '创建卡券' })
  @ApiResponse({ status: 201, description: '卡券创建成功' })
  createCoupon(@Body() createDto: CreateCouponDto) {
    return this.wechatCouponService.createCoupon(createDto);
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: '更新卡券' })
  @ApiParam({ name: 'id', description: '卡券ID' })
  @ApiResponse({ status: 200, description: '卡券更新成功' })
  updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCouponDto,
  ) {
    return this.wechatCouponService.updateCoupon(id, updateDto);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: '删除卡券' })
  @ApiParam({ name: 'id', description: '卡券ID' })
  @ApiResponse({ status: 200, description: '卡券删除成功' })
  deleteCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.wechatCouponService.deleteCoupon(id);
  }

  // 卡券模板管理
  @Get('coupon-templates')
  @ApiOperation({ summary: '获取卡券模板列表' })
  @ApiResponse({ status: 200, description: '获取卡券模板列表成功' })
  getCouponTemplates(@Query() queryDto: QueryCouponTemplateDto) {
    return this.wechatCouponService.getCouponTemplates(queryDto);
  }

  @Get('coupon-templates/:id')
  @ApiOperation({ summary: '获取卡券模板详情' })
  @ApiParam({ name: 'id', description: '卡券模板ID' })
  @ApiResponse({ status: 200, description: '获取卡券模板详情成功' })
  getCouponTemplateById(@Param('id', ParseIntPipe) id: number) {
    return this.wechatCouponService.getCouponTemplateById(id);
  }

  @Post('coupon-templates')
  @ApiOperation({ summary: '创建卡券模板' })
  @ApiResponse({ status: 201, description: '卡券模板创建成功' })
  createCouponTemplate(@Body() createDto: CreateCouponTemplateDto) {
    return this.wechatCouponService.createCouponTemplate(createDto);
  }

  @Put('coupon-templates/:id')
  @ApiOperation({ summary: '更新卡券模板' })
  @ApiParam({ name: 'id', description: '卡券模板ID' })
  @ApiResponse({ status: 200, description: '卡券模板更新成功' })
  updateCouponTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCouponTemplateDto,
  ) {
    return this.wechatCouponService.updateCouponTemplate(id, updateDto);
  }

  @Delete('coupon-templates/:id')
  @ApiOperation({ summary: '删除卡券模板' })
  @ApiParam({ name: 'id', description: '卡券模板ID' })
  @ApiResponse({ status: 200, description: '卡券模板删除成功' })
  deleteCouponTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.wechatCouponService.deleteCouponTemplate(id);
  }

  // 卡券核销记录
  @Get('coupon-records')
  @ApiOperation({ summary: '获取卡券核销记录列表' })
  @ApiResponse({ status: 200, description: '获取卡券核销记录列表成功' })
  getCouponRecords(@Query() queryDto: QueryCouponRecordDto) {
    return this.wechatCouponService.getCouponRecords(queryDto);
  }

  @Get('coupon-records/:id')
  @ApiOperation({ summary: '获取卡券核销记录详情' })
  @ApiParam({ name: 'id', description: '卡券记录ID' })
  @ApiResponse({ status: 200, description: '获取卡券核销记录详情成功' })
  getCouponRecordById(@Param('id', ParseIntPipe) id: number) {
    return this.wechatCouponService.getCouponRecordById(id);
  }

  @Post('coupon-records/:id/verify')
  @ApiOperation({ summary: '核销卡券' })
  @ApiParam({ name: 'id', description: '卡券记录ID' })
  @ApiResponse({ status: 200, description: '卡券核销成功' })
  verifyCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyData: { verifyCode: string; operatorId: number },
  ) {
    return this.wechatCouponService.verifyCoupon(id, verifyData);
  }
}