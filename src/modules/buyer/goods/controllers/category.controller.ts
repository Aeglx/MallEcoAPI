import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('商品分类')
@Controller('buyer/goods/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('get/:parentId')
  list(@Param('parentId') parentId: string) {
    const categories = this.categoryService.listAllChildren(parentId);
    return {
      success: true,
      result: categories
    };
  }
}