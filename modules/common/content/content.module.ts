import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { ArticleComment } from './entities/article-comment.entity';
import { ArticleAttachment } from './entities/article-attachment.entity';
import { SpecialPage } from './entities/special-page.entity';
import { SpecialPageSection } from './entities/special-page-section.entity';
import { ArticleService } from './services/article.service';
import { ArticleCategoryService } from './services/article-category.service';
import { ArticleTagService } from './services/article-tag.service';
import { ArticleCommentService } from './services/article-comment.service';
import { SpecialPageService } from './services/special-page.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleCategory,
      ArticleTag,
      ArticleComment,
      ArticleAttachment,
      SpecialPage,
      SpecialPageSection,
    ]),
  ],
  providers: [
    ArticleService,
    ArticleCategoryService,
    ArticleTagService,
    ArticleCommentService,
    SpecialPageService,
  ],
  exports: [
    ArticleService,
    ArticleCategoryService,
    ArticleTagService,
    ArticleCommentService,
    SpecialPageService,
  ],
})
export class ContentModule {}