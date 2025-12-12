import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArticleService } from '../../../client/common/content/services/article.service';
import { ArticleCategoryService } from '../../../client/common/content/services/article-category.service';
import { ArticleCommentService } from '../../../client/common/content/services/article-comment.service';
import { SpecialPageService } from '../../../client/common/content/services/special-page.service';
import { CreateArticleCommentDto } from '../../../client/common/content/dto/create-article-comment.dto';
import { PaginationDto } from '../../../client/common/dto/pagination.dto';

@ApiTags('买家�?内容管理')
@Controller('buyer/content')
export class BuyerContentController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: ArticleCategoryService,
    private readonly commentService: ArticleCommentService,
    private readonly specialPageService: SpecialPageService,
  ) {}

  // 文章浏览
  @Get('articles')
  @ApiOperation({ summary: '获取文章列表', description: '获取已发布的文章列表（买家端）' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  @ApiQuery({ name: 'categoryId', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'tagId', type: Number, example: 1, required: false })
  async getArticles(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    const [articles, total] = await this.articleService.findPublished(paginationDto, filters);
    return {
      data: articles,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Get('articles/:id')
  @ApiOperation({ summary: '获取文章详情', description: '根据ID获取已发布的文章详情' })
  async getArticle(@Param('id') id: string) {
    const article = await this.articleService.findPublishedOne(+id);
    return {
      data: article,
    };
  }

  @Get('articles/:id/comments')
  @ApiOperation({ summary: '获取文章评论', description: '获取指定文章的评论列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getArticleComments(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    const [comments, total] = await this.commentService.findByArticle(+id, paginationDto);
    return {
      data: comments,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Post('articles/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '发表评论', description: '为指定文章发表评论' })
  async createComment(@Param('id') id: string, @Body() createCommentDto: CreateArticleCommentDto) {
    const comment = await this.commentService.create({
      ...createCommentDto,
      articleId: +id,
    });
    return {
      data: comment,
      message: '评论发表成功，等待审核',
    };
  }

  @Post('articles/:id/like')
  @ApiOperation({ summary: '点赞文章', description: '点赞指定文章' })
  async likeArticle(@Param('id') id: string) {
    const article = await this.articleService.like(+id);
    return {
      data: article,
      message: '点赞成功',
    };
  }

  @Post('articles/:id/share')
  @ApiOperation({ summary: '分享文章', description: '分享指定文章' })
  async shareArticle(@Param('id') id: string) {
    const article = await this.articleService.share(+id);
    return {
      data: article,
      message: '分享成功',
    };
  }

  // 分类浏览
  @Get('categories')
  @ApiOperation({ summary: '获取分类列表', description: '获取所有文章分类' })
  async getCategories() {
    const categories = await this.categoryService.findAll();
    return {
      data: categories,
    };
  }

  @Get('categories/:id/articles')
  @ApiOperation({ summary: '获取分类文章', description: '获取指定分类下的文章列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getCategoryArticles(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    const [articles, total] = await this.articleService.findByCategory(+id, paginationDto);
    return {
      data: articles,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  // 专题页面
  @Get('special-pages')
  @ApiOperation({ summary: '获取专题页面列表', description: '获取已发布的专题页面列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getSpecialPages(@Query() paginationDto: PaginationDto) {
    const [pages, total] = await this.specialPageService.findPublished(paginationDto);
    return {
      data: pages,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Get('special-pages/:id')
  @ApiOperation({ summary: '获取专题页面详情', description: '根据ID获取已发布的专题页面详情' })
  async getSpecialPage(@Param('id') id: string) {
    const page = await this.specialPageService.findPublishedOne(+id);
    return {
      data: page,
    };
  }

  // 搜索功能
  @Get('search')
  @ApiOperation({ summary: '搜索内容', description: '根据关键词搜索文章和专题页面' })
  @ApiQuery({ name: 'keyword', type: String, example: '测试', required: true })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async searchContent(@Query('keyword') keyword: string, @Query() paginationDto: PaginationDto) {
    const [articles, total] = await this.articleService.search(keyword, paginationDto);
    const [pages, pageTotal] = await this.specialPageService.search(keyword, paginationDto);
    
    return {
      data: {
        articles,
        specialPages: pages,
      },
      total: total + pageTotal,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  // 热门内容
  @Get('hot-articles')
  @ApiOperation({ summary: '获取热门文章', description: '获取热门文章列表' })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getHotArticles(@Query('limit') limit: string) {
    const articles = await this.articleService.findHot(parseInt(limit) || 10);
    return {
      data: articles,
    };
  }

  @Get('recommended-articles')
  @ApiOperation({ summary: '获取推荐文章', description: '获取推荐文章列表' })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getRecommendedArticles(@Query('limit') limit: string) {
    const articles = await this.articleService.findRecommended(parseInt(limit) || 10);
    return {
      data: articles,
    };
  }

  // 标签浏览
  @Get('tags')
  @ApiOperation({ summary: '获取标签列表', description: '获取所有标签' })
  async getTags() {
    const tags = await this.articleService.findAllTags();
    return {
      data: tags,
    };
  }

  @Get('tags/:id/articles')
  @ApiOperation({ summary: '获取标签文章', description: '获取指定标签下的文章列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getTagArticles(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    const [articles, total] = await this.articleService.findByTag(+id, paginationDto);
    return {
      data: articles,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }
}
