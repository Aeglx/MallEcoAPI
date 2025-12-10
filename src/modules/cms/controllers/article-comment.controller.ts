import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ArticleCommentService } from '../services/article-comment.service';

@ApiTags('内容管理-文章评论')
@Controller('cms/article-comments')
export class ArticleCommentController {
  constructor(private readonly articleCommentService: ArticleCommentService) {}

  @Get()
  @ApiOperation({ summary: '获取评论列表', description: '分页获取文章评论列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findAll() {
    return await this.articleCommentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取评论详情', description: '根据ID获取评论详细信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return await this.articleCommentService.findOne(+id);
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: '获取文章评论', description: '获取指定文章的所有评论' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findByArticleId(@Param('articleId') articleId: string) {
    return await this.articleCommentService.findByArticleId(+articleId);
  }

  @Post()
  @ApiOperation({ summary: '创建评论', description: '创建新的文章评论' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '评论创建成功' })
  async create(@Body() createDto: any) {
    return await this.articleCommentService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新评论', description: '更新评论信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return await this.articleCommentService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除评论', description: '删除指定评论' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return await this.articleCommentService.remove(+id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: '审核通过', description: '审核通过评论' })
  @ApiResponse({ status: HttpStatus.OK, description: '审核通过成功' })
  async approve(@Param('id') id: string) {
    return await this.articleCommentService.approve(+id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '审核拒绝', description: '审核拒绝评论' })
  @ApiResponse({ status: HttpStatus.OK, description: '审核拒绝成功' })
  async reject(@Param('id') id: string) {
    return await this.articleCommentService.reject(+id);
  }

  @Get('statistics/:articleId?')
  @ApiOperation({ summary: '获取评论统计', description: '获取评论的统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getStatistics(@Param('articleId') articleId?: string) {
    return await this.articleCommentService.getStatistics(
      articleId ? +articleId : undefined
    );
  }
}