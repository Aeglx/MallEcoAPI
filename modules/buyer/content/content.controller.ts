import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArticleService } from '../../common/content/services/article.service';
import { ArticleCategoryService } from '../../common/content/services/article-category.service';
import { ArticleTagService } from '../../common/content/services/article-tag.service';
import { ArticleCommentService } from '../../common/content/services/article-comment.service';
import { SpecialPageService } from '../../common/content/services/special-page.service';
import { CreateArticleCommentDto } from '../../common/content/dto/create-article-comment.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('买家端-内容管理')
@Controller('buyer/content')
export class BuyerContentController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: ArticleCategoryService,
    private readonly tagService: ArticleTagService,
    private readonly commentService: ArticleCommentService,
    private readonly specialPageService: SpecialPageService,
  ) {}

  @Get('articles')
  @ApiOperation({ summary: '获取文章列表', description: '获取已发布的文章列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  @ApiQuery({ name: 'categoryId', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'tagIds', type: [Number], example: [1, 2], required: false })
  @ApiQuery({ name: 'keyword', type: String, example: '电商', required: false })
  async getArticles(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    const [articles, total] = await this.articleService.findAll(paginationDto, filters);
    return {
      data: articles,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Get('articles/:id')
  @ApiOperation({ summary: '获取文章详情', description: '根据ID获取文章详情' })
  @ApiResponse({ status: 200, description: '文章详情' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async getArticle(@Param('id') id: string) {
    const article = await this.articleService.findOne(+id);
    
    // 增加阅读量
    await this.articleService.incrementViewCount(+id);
    
    return {
      data: article,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: '获取文章分类', description: '获取所有文章分类' })
  async getCategories() {
    const categories = await this.categoryService.findAll();
    return {
      data: categories,
    };
  }

  @Get('categories/tree')
  @ApiOperation({ summary: '获取分类树', description: '获取分类的树形结构' })
  async getCategoryTree() {
    const categories = await this.categoryService.findTree();
    return {
      data: categories,
    };
  }

  @Get('tags')
  @ApiOperation({ summary: '获取标签列表', description: '获取所有标签' })
  async getTags() {
    const tags = await this.tagService.findAll();
    return {
      data: tags,
    };
  }

  @Get('tags/popular')
  @ApiOperation({ summary: '获取热门标签', description: '获取使用频率最高的标签' })
  @ApiQuery({ name: 'limit', type: Number, example: 20, required: false })
  async getPopularTags(@Query('limit') limit: number = 20) {
    const tags = await this.tagService.findPopularTags(limit);
    return {
      data: tags,
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
  @ApiOperation({ summary: '发表评论', description: '对指定文章发表评论' })
  @ApiResponse({ status: 201, description: '评论发表成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '点赞文章', description: '对指定文章进行点赞' })
  async likeArticle(@Param('id') id: string) {
    await this.articleService.incrementLikeCount(+id);
    return {
      message: '点赞成功',
    };
  }

  @Delete('articles/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消点赞', description: '取消对指定文章的点赞' })
  async unlikeArticle(@Param('id') id: string) {
    await this.articleService.decrementLikeCount(+id);
    return {
      message: '取消点赞成功',
    };
  }

  @Post('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '点赞评论', description: '对指定评论进行点赞' })
  async likeComment(@Param('id') id: string) {
    await this.commentService.incrementLikeCount(+id);
    return {
      message: '点赞成功',
    };
  }

  @Delete('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消点赞评论', description: '取消对指定评论的点赞' })
  async unlikeComment(@Param('id') id: string) {
    await this.commentService.decrementLikeCount(+id);
    return {
      message: '取消点赞成功',
    };
  }

  @Get('special-pages')
  @ApiOperation({ summary: '获取专题页面列表', description: '获取已发布的专题页面列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getSpecialPages(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    const [pages, total] = await this.specialPageService.findAll(paginationDto, filters);
    return {
      data: pages,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Get('special-pages/:id')
  @ApiOperation({ summary: '获取专题页面详情', description: '根据ID获取专题页面详情' })
  @ApiResponse({ status: 200, description: '专题页面详情' })
  @ApiResponse({ status: 404, description: '专题页面不存在' })
  async getSpecialPage(@Param('id') id: string) {
    const page = await this.specialPageService.findOne(+id);
    
    // 增加浏览量
    await this.specialPageService.incrementViewCount(+id);
    
    return {
      data: page,
    };
  }

  @Get('articles/top')
  @ApiOperation({ summary: '获取置顶文章', description: '获取置顶的文章列表' })
  @ApiQuery({ name: 'limit', type: Number, example: 5, required: false })
  async getTopArticles(@Query('limit') limit: number = 5) {
    const articles = await this.articleService.getTopArticles(limit);
    return {
      data: articles,
    };
  }

  @Get('articles/recommend')
  @ApiOperation({ summary: '获取推荐文章', description: '获取推荐的文章列表' })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getRecommendArticles(@Query('limit') limit: number = 10) {
    const articles = await this.articleService.getRecommendArticles(limit);
    return {
      data: articles,
    };
  }

  @Get('special-pages/top')
  @ApiOperation({ summary: '获取置顶专题页面', description: '获取置顶的专题页面列表' })
  @ApiQuery({ name: 'limit', type: Number, example: 5, required: false })
  async getTopSpecialPages(@Query('limit') limit: number = 5) {
    const pages = await this.specialPageService.getTopSpecialPages(limit);
    return {
      data: pages,
    };
  }

  @Get('special-pages/recommend')
  @ApiOperation({ summary: '获取推荐专题页面', description: '获取推荐的专题页面列表' })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getRecommendSpecialPages(@Query('limit') limit: number = 10) {
    const pages = await this.specialPageService.getRecommendSpecialPages(limit);
    return {
      data: pages,
    };
  }
}