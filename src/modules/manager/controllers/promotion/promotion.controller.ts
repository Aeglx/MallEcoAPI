import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

@Controller('manager/promotion')
export class PromotionController {
  
  @Get()
  findAll(@Query() query: any) {
    return { message: '获取促销活动列表', query };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取促销活动详情', id };
  }

  @Post()
  create(@Body() promotionData: any) {
    return { message: '创建促销活动', promotionData };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() promotionData: any) {
    return { message: '更新促销活动', id, promotionData };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: '删除促销活动', id };
  }
}