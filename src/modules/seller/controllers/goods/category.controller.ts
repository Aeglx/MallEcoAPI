import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryService } from '../../services/goods/category.service';

@Controller('seller/goods/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  
  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id);
  }

  @Post()
  async create(@Body() categoryData: any) {
    return await this.categoryService.create(categoryData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() categoryData: any) {
    return await this.categoryService.update(id, categoryData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(id);
  }
}