import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('订单管理')
@Controller('manager/order')
export class OrderController {
  @Get()
  findAll(@Query() query: any) {
    return { message: '获取订单列表', query };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取订单详情', id };
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return { message: '更新订单状态', id, statusData };
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Body() refundData: any) {
    return { message: '订单退款', id, refundData };
  }
}
