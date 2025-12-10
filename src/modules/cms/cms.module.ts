import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { ArticleComment } from './entities/article-comment.entity';
import { ArticleService } from './services/article.service';
import { ArticleCategoryService } from './services/article-category.service';
import { ArticleTagService } from './services/article-tag.service';
import { ArticleCommentService } from './services/article-comment.service';
import { ArticleController } from './controllers/article.controller';
import { ArticleCategoryController } from './controllers/article-category.controller';
import { ArticleTagController } from './controllers/article-tag.controller';
import { ArticleCommentController } from './controllers/article-comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleCategory,
      ArticleTag,
      ArticleComment,
    ]),
  ],
  controllers: [
    ArticleController,
    ArticleCategoryController,
    ArticleTagController,
    ArticleCommentController,
  ],
  providers: [
    ArticleService,
    ArticleCategoryService,
    ArticleTagService,
    ArticleCommentService,
  ],
  exports: [
    ArticleService,
    ArticleCategoryService,
  ],
})
export class CmsModule {}