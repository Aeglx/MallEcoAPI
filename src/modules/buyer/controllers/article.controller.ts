import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticleService } from '../services/article.service';
import { ArticleCategoryService } from '../services/article-category.service';

@ApiTags('内容管理')
@Controller('buyer/other/article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly articleCategoryService: ArticleCategoryService
  ) {}

  @Get('articleCategory/list')
  getArticleCategoryList() {
    const categories = this.articleCategoryService.allChildren();
    return {
      success: true,
      result: categories
    };
  }

  @Get()
  getByPage(@Query() articleSearchParams: any) {
    const articles = this.articleService.articlePage(articleSearchParams);
    return {
      success: true,
      result: articles
    };
  }

  @Get('get/:id')
  get(@Param('id') id: string) {
    const article = this.articleService.customGet(id);
    if (!article) {
      return {
        success: false,
        message: '文章不存在'
      };
    }
    return {
      success: true,
      result: article
    };
  }

  @Get('type/:type')
  getByType(@Param('type') type: string) {
    const article = this.articleService.customGetByType(type);
    if (!article) {
      return {
        success: false,
        message: '文章不存在'
      };
    }
    return {
      success: true,
      result: article
    };
  }
}