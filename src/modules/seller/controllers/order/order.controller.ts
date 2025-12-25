import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('订单管理')
@Controller('seller/order')
export class OrderController {
  
  @Get()
  findAll(@Query() query: any) {
    return { message: '获取卖家订单列表', query };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取卖家订单详情', id };
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return { message: '更新卖家订单状态', id, statusData };
  }

  @Post(':id/ship')
  ship(@Param('id') id: string, @Body() shipData: any) {
    return { message: '卖家订单发货', id, shipData };
  }
}