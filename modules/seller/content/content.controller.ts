import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArticleService } from '../../../common/content/services/article.service';
import { ArticleCategoryService } from '../../../common/content/services/article-category.service';
import { ArticleTagService } from '../../../common/content/services/article-tag.service';
import { ArticleCommentService } from '../../../common/content/services/article-comment.service';
import { SpecialPageService } from '../../../common/content/services/special-page.service';
import { CreateArticleDto } from '../../../common/content/dto/create-article.dto';
import { UpdateArticleDto } from '../../../common/content/dto/update-article.dto';
import { CreateArticleCategoryDto } from '../../../common/content/dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from '../../../common/content/dto/update-article-category.dto';
import { CreateArticleTagDto } from '../../../common/content/dto/create-article-tag.dto';
import { UpdateArticleTagDto } from '../../../common/content/dto/update-article-tag.dto';
import { CreateSpecialPageDto } from '../../../common/content/dto/create-special-page.dto';
import { UpdateSpecialPageDto } from '../../../common/content/dto/update-special-page.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('卖家端-内容管理')
@Controller('seller/content')
export class SellerContentController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: ArticleCategoryService,
    private readonly tagService: ArticleTagService,
    private readonly commentService: ArticleCommentService,
    private readonly specialPageService: SpecialPageService,
  ) {}

  // 文章管理
  @Get('articles')
  @ApiOperation({ summary: '获取文章列表', description: '获取店铺文章列表（卖家端）' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  @ApiQuery({ name: 'status', type: String, example: 'published', required: false })
  async getArticles(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    // 卖家端只能查看自己店铺的文章
    const storeId = 1; // 从认证信息中获取店铺ID
    const [articles, total] = await this.articleService.findByStore(storeId, paginationDto, filters);
    return {
      data: articles,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Post('articles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建文章', description: '创建新的店铺文章' })
  async createArticle(@Body() createArticleDto: CreateArticleDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const article = await this.articleService.create({
      ...createArticleDto,
      storeId,
    });
    return {
      data: article,
      message: '文章创建成功',
    };
  }

  @Get('articles/:id')
  @ApiOperation({ summary: '获取文章详情', description: '根据ID获取文章详情' })
  async getArticle(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const article = await this.articleService.findOneByStore(+id, storeId);
    return {
      data: article,
    };
  }

  @Patch('articles/:id')
  @ApiOperation({ summary: '更新文章', description: '更新指定文章' })
  async updateArticle(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const article = await this.articleService.updateByStore(+id, storeId, updateArticleDto);
    return {
      data: article,
      message: '文章更新成功',
    };
  }

  @Delete('articles/:id')
  @ApiOperation({ summary: '删除文章', description: '删除指定文章' })
  async deleteArticle(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    await this.articleService.removeByStore(+id, storeId);
    return {
      message: '文章删除成功',
    };
  }

  @Post('articles/:id/publish')
  @ApiOperation({ summary: '发布文章', description: '发布指定文章' })
  async publishArticle(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const article = await this.articleService.publishByStore(+id, storeId);
    return {
      data: article,
      message: '文章发布成功',
    };
  }

  @Post('articles/:id/unpublish')
  @ApiOperation({ summary: '取消发布文章', description: '取消发布指定文章' })
  async unpublishArticle(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const article = await this.articleService.unpublishByStore(+id, storeId);
    return {
      data: article,
      message: '文章取消发布成功',
    };
  }

  // 分类管理
  @Get('categories')
  @ApiOperation({ summary: '获取分类列表', description: '获取店铺文章分类' })
  async getCategories() {
    const storeId = 1; // 从认证信息中获取店铺ID
    const categories = await this.categoryService.findByStore(storeId);
    return {
      data: categories,
    };
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建分类', description: '创建新的店铺文章分类' })
  async createCategory(@Body() createCategoryDto: CreateArticleCategoryDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const category = await this.categoryService.create({
      ...createCategoryDto,
      storeId,
    });
    return {
      data: category,
      message: '分类创建成功',
    };
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: '更新分类', description: '更新指定分类' })
  async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateArticleCategoryDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const category = await this.categoryService.updateByStore(+id, storeId, updateCategoryDto);
    return {
      data: category,
      message: '分类更新成功',
    };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '删除分类', description: '删除指定分类' })
  async deleteCategory(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    await this.categoryService.removeByStore(+id, storeId);
    return {
      message: '分类删除成功',
    };
  }

  // 标签管理
  @Get('tags')
  @ApiOperation({ summary: '获取标签列表', description: '获取店铺文章标签' })
  async getTags() {
    const storeId = 1; // 从认证信息中获取店铺ID
    const tags = await this.tagService.findByStore(storeId);
    return {
      data: tags,
    };
  }

  @Post('tags')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建标签', description: '创建新的店铺文章标签' })
  async createTag(@Body() createTagDto: CreateArticleTagDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const tag = await this.tagService.create({
      ...createTagDto,
      storeId,
    });
    return {
      data: tag,
      message: '标签创建成功',
    };
  }

  @Patch('tags/:id')
  @ApiOperation({ summary: '更新标签', description: '更新指定标签' })
  async updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateArticleTagDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const tag = await this.tagService.updateByStore(+id, storeId, updateTagDto);
    return {
      data: tag,
      message: '标签更新成功',
    };
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: '删除标签', description: '删除指定标签' })
  async deleteTag(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    await this.tagService.removeByStore(+id, storeId);
    return {
      message: '标签删除成功',
    };
  }

  // 评论管理
  @Get('comments')
  @ApiOperation({ summary: '获取评论列表', description: '获取店铺文章评论列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getComments(@Query() paginationDto: PaginationDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const [comments, total] = await this.commentService.findByStore(storeId, paginationDto);
    return {
      data: comments,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Get('comments/pending')
  @ApiOperation({ summary: '获取待审核评论', description: '获取待审核的评论列表' })
  async getPendingComments() {
    const storeId = 1; // 从认证信息中获取店铺ID
    const comments = await this.commentService.getPendingCommentsByStore(storeId);
    return {
      data: comments,
    };
  }

  @Post('comments/:id/approve')
  @ApiOperation({ summary: '审核通过评论', description: '审核通过指定评论' })
  async approveComment(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const comment = await this.commentService.approveByStore(+id, storeId);
    return {
      data: comment,
      message: '评论审核通过',
    };
  }

  @Post('comments/:id/reject')
  @ApiOperation({ summary: '审核拒绝评论', description: '审核拒绝指定评论' })
  async rejectComment(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const comment = await this.commentService.rejectByStore(+id, storeId);
    return {
      data: comment,
      message: '评论审核拒绝',
    };
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: '删除评论', description: '删除指定评论' })
  async deleteComment(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    await this.commentService.removeByStore(+id, storeId);
    return {
      message: '评论删除成功',
    };
  }

  // 专题页面管理
  @Get('special-pages')
  @ApiOperation({ summary: '获取专题页面列表', description: '获取店铺专题页面列表' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  async getSpecialPages(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const [pages, total] = await this.specialPageService.findByStore(storeId, paginationDto, filters);
    return {
      data: pages,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Post('special-pages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建专题页面', description: '创建新的专题页面' })
  async createSpecialPage(@Body() createSpecialPageDto: CreateSpecialPageDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const page = await this.specialPageService.create({
      ...createSpecialPageDto,
      storeId,
    });
    return {
      data: page,
      message: '专题页面创建成功',
    };
  }

  @Get('special-pages/:id')
  @ApiOperation({ summary: '获取专题页面详情', description: '根据ID获取专题页面详情' })
  async getSpecialPage(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const page = await this.specialPageService.findOneByStore(+id, storeId);
    return {
      data: page,
    };
  }

  @Patch('special-pages/:id')
  @ApiOperation({ summary: '更新专题页面', description: '更新指定专题页面' })
  async updateSpecialPage(@Param('id') id: string, @Body() updateSpecialPageDto: UpdateSpecialPageDto) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const page = await this.specialPageService.updateByStore(+id, storeId, updateSpecialPageDto);
    return {
      data: page,
      message: '专题页面更新成功',
    };
  }

  @Delete('special-pages/:id')
  @ApiOperation({ summary: '删除专题页面', description: '删除指定专题页面' })
  async deleteSpecialPage(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    await this.specialPageService.removeByStore(+id, storeId);
    return {
      message: '专题页面删除成功',
    };
  }

  @Post('special-pages/:id/publish')
  @ApiOperation({ summary: '发布专题页面', description: '发布指定专题页面' })
  async publishSpecialPage(@Param('id') id: string) {
    const storeId = 1; // 从认证信息中获取店铺ID
    const page = await this.specialPageService.publishByStore(+id, storeId);
    return {
      data: page,
      message: '专题页面发布成功',
    };
  }

  // 统计信息
  @Get('statistics')
  @ApiOperation({ summary: '获取内容统计', description: '获取店铺内容管理系统的统计信息' })
  async getStatistics() {
    const storeId = 1; // 从认证信息中获取店铺ID
    const articleStats = await this.articleService.getArticleStatisticsByStore(storeId);
    const categoryStats = await this.categoryService.getCategoryStatisticsByStore(storeId);
    const tagStats = await this.tagService.getTagStatisticsByStore(storeId);
    const commentStats = await this.commentService.getCommentStatisticsByStore(storeId);
    const specialPageStats = await this.specialPageService.getSpecialPageStatisticsByStore(storeId);

    return {
      data: {
        articles: articleStats,
        categories: categoryStats,
        tags: tagStats,
        comments: commentStats,
        specialPages: specialPageStats,
      },
    };
  }
}