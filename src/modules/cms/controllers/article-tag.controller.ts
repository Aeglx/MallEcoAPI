import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ArticleTagService } from '../services/article-tag.service';
import { CreateArticleTagDto } from '../dto/create-article-tag.dto';
import { UpdateArticleTagDto } from '../dto/update-article-tag.dto';

@ApiTags('内容管理-文章标签')
@Controller('cms/article-tags')
export class ArticleTagController {
  constructor(private readonly articleTagService: ArticleTagService) {}

  @Post()
  @ApiOperation({ summary: '创建文章标签', description: '创建新的文章标签' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '标签创建成功' })
  @ApiBody({ type: CreateArticleTagDto })
  async create(@Body() createArticleTagDto: CreateArticleTagDto) {
    return await this.articleTagService.create(createArticleTagDto);
  }

  @Get()
  @ApiOperation({ summary: '获取文章标签列表', description: '获取所有文章标签' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findAll() {
    return await this.articleTagService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情', description: '根据ID获取标签详细信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return await this.articleTagService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新标签', description: '更新标签信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  @ApiBody({ type: UpdateArticleTagDto })
  async update(@Param('id') id: string, @Body() updateArticleTagDto: UpdateArticleTagDto) {
    return await this.articleTagService.update(+id, updateArticleTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除标签', description: '删除指定标签' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return await this.articleTagService.remove(+id);
  }

  @Get(':id/articles')
  @ApiOperation({ summary: '获取标签下的文章', description: '获取指定标签下的所有文章' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getArticlesByTag(@Param('id') id: string) {
    return await this.articleTagService.getArticlesByTag(+id);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建标签', description: '批量创建多个标签' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '批量创建成功' })
  async batchCreate(@Body() createDtos: CreateArticleTagDto[]) {
    return await this.articleTagService.batchCreate(createDtos);
  }
}