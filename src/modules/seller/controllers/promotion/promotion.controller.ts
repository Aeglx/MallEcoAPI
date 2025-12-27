import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('促销营销')
@Controller('seller/promotion')
export class PromotionController {
  @Get()
  findAll(@Query() query: any) {
    return { message: '获取卖家促销活动列表', query };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取卖家促销活动详情', id };
  }

  @Post()
  create(@Body() promotionData: any) {
    return { message: '创建卖家促销活动', promotionData };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() promotionData: any) {
    return { message: '更新卖家促销活动', id, promotionData };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: '删除卖家促销活动', id };
  }
}
