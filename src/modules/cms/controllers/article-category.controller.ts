import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ArticleCategoryService } from '../services/article-category.service';
import { CreateArticleCategoryDto } from '../dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from '../dto/update-article-category.dto';

@ApiTags('内容管理-文章分类')
@Controller('cms/article-categories')
export class ArticleCategoryController {
  constructor(private readonly articleCategoryService: ArticleCategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建文章分类', description: '创建新的文章分类' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '分类创建成功' })
  @ApiBody({ type: CreateArticleCategoryDto })
  async create(@Body() createArticleCategoryDto: CreateArticleCategoryDto) {
    return await this.articleCategoryService.create(createArticleCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取文章分类列表', description: '获取所有文章分类' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findAll() {
    return await this.articleCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情', description: '根据ID获取分类详细信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return await this.articleCategoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分类', description: '更新分类信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  @ApiBody({ type: UpdateArticleCategoryDto })
  async update(@Param('id') id: string, @Body() updateArticleCategoryDto: UpdateArticleCategoryDto) {
    return await this.articleCategoryService.update(+id, updateArticleCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类', description: '删除指定分类' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return await this.articleCategoryService.remove(+id);
  }

  @Get(':id/articles')
  @ApiOperation({ summary: '获取分类下的文章', description: '获取指定分类下的所有文章' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getArticlesByCategory(@Param('id') id: string) {
    return await this.articleCategoryService.getArticlesByCategory(+id);
  }

  @Patch(':id/sort')
  @ApiOperation({ summary: '调整分类排序', description: '调整分类的显示顺序' })
  @ApiResponse({ status: HttpStatus.OK, description: '排序成功' })
  async updateSort(@Param('id') id: string, @Body('sortWeight') sortWeight: number) {
    return await this.articleCategoryService.updateSort(+id, sortWeight);
  }
}