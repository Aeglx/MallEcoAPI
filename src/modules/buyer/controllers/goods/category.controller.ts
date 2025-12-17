import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('buyer/goods/category')
export class CategoryController {
  
  @Get()
  findAll(@Query() query: any) {
    // 获取所有商品分类
    return { message: '获取商品分类列表' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // 获取指定分类详情
    return { message: `获取分类 ${id} 详情` };
  }

  @Get(':id/goods')
  findGoodsByCategory(@Param('id') id: string, @Query() query: any) {
    // 获取分类下的商品
    return { message: `获取分类 ${id} 下的商品` };
  }
}