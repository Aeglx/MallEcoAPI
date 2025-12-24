import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Article } from './entities/article.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';

@ApiTags('内容管理')
@Controller('api/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // 文章相关接口
  @UseGuards(AdminAuthGuard)
  @Post('articles')
  @ApiOperation({ summary: '创建文章', description: '创建新的文章' })
  @ApiResponse({ status: 201, description: '文章创建成功', type: Article })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createArticle(@Body() createArticleDto: CreateArticleDto) {
    return await this.contentService.createArticle(createArticleDto);
  }

  @Get('articles')
  @ApiOperation({ summary: '获取文章列表', description: '获取文章列表，支持分页和关键词搜索' })
  @ApiResponse({ status: 200, description: '获取文章列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: 10 })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索', example: '测试' })
  async getArticles(@Query() paginationDto: PaginationDto) {
    return await this.contentService.getArticles(paginationDto);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: '获取文章详情', description: '根据ID获取文章详情' })
  @ApiResponse({ status: 200, description: '获取文章详情成功', type: Article })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiParam({ name: 'id', description: '文章ID', example: '1234567890abcdef12345678' })
  async getArticleById(@Param('id') id: string) {
    return await this.contentService.getArticleById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Put('articles/:id')
  @ApiOperation({ summary: '更新文章', description: '根据ID更新文章信息' })
  @ApiResponse({ status: 200, description: '更新文章成功', type: Article })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiParam({ name: 'id', description: '文章ID', example: '1234567890abcdef12345678' })
  async updateArticle(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return await this.contentService.updateArticle(id, updateArticleDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('articles/:id')
  @ApiOperation({ summary: '删除文章', description: '根据ID删除文章' })
  @ApiResponse({ status: 200, description: '删除文章成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiParam({ name: 'id', description: '文章ID', example: '1234567890abcdef12345678' })
  async deleteArticle(@Param('id') id: string) {
    return await this.contentService.deleteArticle(id);
  }

  // 分类相关接口
  @UseGuards(AdminAuthGuard)
  @Post('categories')
  @ApiOperation({ summary: '创建分类', description: '创建新的分类' })
  @ApiResponse({ status: 201, description: '分类创建成功', type: Category })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.contentService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取分类列表', description: '获取分类列表，支持分页和关键词搜索' })
  @ApiResponse({ status: 200, description: '获取分类列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: 10 })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索', example: '新闻' })
  async getCategories(@Query() paginationDto: PaginationDto) {
    return await this.contentService.getCategories(paginationDto);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: '获取分类详情', description: '根据ID获取分类详情' })
  @ApiResponse({ status: 200, description: '获取分类详情成功', type: Category })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiParam({ name: 'id', description: '分类ID', example: '1234567890abcdef12345678' })
  async getCategoryById(@Param('id') id: string) {
    return await this.contentService.getCategoryById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Put('categories/:id')
  @ApiOperation({ summary: '更新分类', description: '根据ID更新分类信息' })
  @ApiResponse({ status: 200, description: '更新分类成功', type: Category })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiParam({ name: 'id', description: '分类ID', example: '1234567890abcdef12345678' })
  async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.contentService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('categories/:id')
  @ApiOperation({ summary: '删除分类', description: '根据ID删除分类' })
  @ApiResponse({ status: 200, description: '删除分类成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 409, description: '该分类下有文章，无法删除' })
  @ApiParam({ name: 'id', description: '分类ID', example: '1234567890abcdef12345678' })
  async deleteCategory(@Param('id') id: string) {
    return await this.contentService.deleteCategory(id);
  }

  // 标签相关接口
  @UseGuards(AdminAuthGuard)
  @Post('tags')
  @ApiOperation({ summary: '创建标签', description: '创建新的标签' })
  @ApiResponse({ status: 201, description: '标签创建成功', type: Tag })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '标签名称已存在' })
  async createTag(@Body() createTagDto: CreateTagDto) {
    return await this.contentService.createTag(createTagDto);
  }

  @Get('tags')
  @ApiOperation({ summary: '获取标签列表', description: '获取标签列表，支持分页和关键词搜索' })
  @ApiResponse({ status: 200, description: '获取标签列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: 10 })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索', example: '科技' })
  async getTags(@Query() paginationDto: PaginationDto) {
    return await this.contentService.getTags(paginationDto);
  }

  @Get('tags/:id')
  @ApiOperation({ summary: '获取标签详情', description: '根据ID获取标签详情' })
  @ApiResponse({ status: 200, description: '获取标签详情成功', type: Tag })
  @ApiResponse({ status: 404, description: '标签不存在' })
  @ApiParam({ name: 'id', description: '标签ID', example: '1234567890abcdef12345678' })
  async getTagById(@Param('id') id: string) {
    return await this.contentService.getTagById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Put('tags/:id')
  @ApiOperation({ summary: '更新标签', description: '根据ID更新标签信息' })
  @ApiResponse({ status: 200, description: '更新标签成功', type: Tag })
  @ApiResponse({ status: 404, description: '标签不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '标签名称已存在' })
  @ApiParam({ name: 'id', description: '标签ID', example: '1234567890abcdef12345678' })
  async updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return await this.contentService.updateTag(id, updateTagDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('tags/:id')
  @ApiOperation({ summary: '删除标签', description: '根据ID删除标签' })
  @ApiResponse({ status: 200, description: '删除标签成功' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  @ApiParam({ name: 'id', description: '标签ID', example: '1234567890abcdef12345678' })
  async deleteTag(@Param('id') id: string) {
    return await this.contentService.deleteTag(id);
  }
}
