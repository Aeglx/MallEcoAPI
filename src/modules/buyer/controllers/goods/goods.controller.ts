import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

@Controller('buyer/goods')
export class GoodsController {
  
  @Get()
  findAll(@Query() query: any) {
    return { message: '获取商品列表', query };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取商品详情', id };
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return { message: '根据分类获取商品', categoryId };
  }
}