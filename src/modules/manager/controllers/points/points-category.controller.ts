import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PointsCategoryService } from '../../services/points/points-category.service';

@ApiTags('积分商城-分类管理')
@Controller('manager/points/category')
export class PointsCategoryController {
  constructor(private readonly pointsCategoryService: PointsCategoryService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.pointsCategoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointsCategoryService.findOne(Number(id));
  }

  @Post()
  create(@Body() categoryData: any) {
    return this.pointsCategoryService.create(categoryData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() categoryData: any) {
    return this.pointsCategoryService.update(Number(id), categoryData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pointsCategoryService.remove(Number(id));
  }
}
