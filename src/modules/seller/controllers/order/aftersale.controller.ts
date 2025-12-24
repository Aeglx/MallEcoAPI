import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

@Controller('seller/order/aftersale')
export class AfterSaleController {
  
  @Get()
  findAll(@Query() query: any) {
    // 获取售后列表
    return { message: '获取售后列表' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // 获取售后详情
    return { message: `获取售后 ${id} 详情` };
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    // 审核通过售后申请
    return { message: `审核通过售后申请 ${id}` };
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() rejectDto: any) {
    // 拒绝售后申请
    return { message: `拒绝售后申请 ${id}` };
  }

  @Patch(':id/process')
  process(@Param('id') id: string, @Body() processDto: any) {
    // 处理售后申请
    return { message: `处理售后申请 ${id}` };
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    // 完成售后处理
    return { message: `完成售后处理 ${id}` };
  }

  @Get('statistics')
  getStatistics() {
    // 获取售后统计
    return { message: '获取售后统计' };
  }
}