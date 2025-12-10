import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticleSearchDto } from '../dto/article-search.dto';

@ApiTags('内容管理-文章')
@Controller('cms/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: '创建文章', description: '创建新的文章内容' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '文章创建成功' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  @ApiBody({ type: CreateArticleDto })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return await this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取文章列表', description: '分页获取文章列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findAll(@Query() searchDto: ArticleSearchDto) {
    return await this.articleService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文章详情', description: '根据ID获取文章详细信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '文章不存在' })
  async findOne(@Param('id') id: string) {
    return await this.articleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新文章', description: '更新文章信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '文章不存在' })
  @ApiBody({ type: UpdateArticleDto })
  async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return await this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文章', description: '删除指定文章' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '文章不存在' })
  async remove(@Param('id') id: string) {
    return await this.articleService.remove(+id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: '发布文章', description: '发布文章到前台显示' })
  @ApiResponse({ status: HttpStatus.OK, description: '发布成功' })
  async publish(@Param('id') id: string) {
    return await this.articleService.publish(+id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: '取消发布', description: '取消文章发布状态' })
  @ApiResponse({ status: HttpStatus.OK, description: '取消发布成功' })
  async unpublish(@Param('id') id: string) {
    return await this.articleService.unpublish(+id);
  }

  @Patch(':id/recommend')
  @ApiOperation({ summary: '推荐文章', description: '设置文章为推荐状态' })
  @ApiResponse({ status: HttpStatus.OK, description: '推荐成功' })
  async recommend(@Param('id') id: string) {
    return await this.articleService.recommend(+id);
  }

  @Patch(':id/cancel-recommend')
  @ApiOperation({ summary: '取消推荐', description: '取消文章推荐状态' })
  @ApiResponse({ status: HttpStatus.OK, description: '取消推荐成功' })
  async cancelRecommend(@Param('id') id: string) {
    return await this.articleService.cancelRecommend(+id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: '获取文章统计', description: '获取文章的阅读量、点赞数等统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getStatistics(@Param('id') id: string) {
    return await this.articleService.getStatistics(+id);
  }
}