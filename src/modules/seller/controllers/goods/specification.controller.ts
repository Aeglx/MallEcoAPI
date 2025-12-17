import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

@Controller('seller/goods/specification')
export class SpecificationController {
  
  @Get()
  findAll(@Query() query: any) {
    // 获取规格列表
    return { message: '获取规格列表' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // 获取规格详情
    return { message: `获取规格 ${id} 详情` };
  }

  @Post()
  create(@Body() createDto: any) {
    // 创建规格
    return { message: '创建规格' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    // 更新规格
    return { message: `更新规格 ${id}` };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // 删除规格
    return { message: `删除规格 ${id}` };
  }

  @Post('batch')
  batchOperation(@Body() batchDto: any) {
    // 批量操作规格
    return { message: '批量操作规格' };
  }
}