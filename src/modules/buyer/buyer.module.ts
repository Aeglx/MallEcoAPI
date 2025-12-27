import { Module } from '@nestjs/common';
import { PageDataController } from './controllers/page-data.controller';
import { PageDataService } from './services/page-data.service';
import { GoodsController } from './goods/controllers/goods.controller';
import { HotWordsService } from './goods/services/hot-words.service';
import { CategoryController } from './goods/controllers/category.controller';
import { CategoryService } from './goods/services/category.service';
import { GoodsService } from './goods/services/goods.service';
import { MemberBuyerController } from './passport/controllers/member.controller';
import { MemberService } from './passport/services/member.service';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { ArticleCategoryService } from './services/article-category.service';
import { CouponController } from './promotion/controllers/coupon.controller';
import { CouponService } from './promotion/services/coupon.service';

@Module({
  controllers: [
    PageDataController,
    GoodsController,
    CategoryController,
    MemberBuyerController,
    ArticleController,
    CouponController,
  ],
  providers: [
    PageDataService,
    HotWordsService,
    CategoryService,
    GoodsService,
    MemberService,
    ArticleService,
    ArticleCategoryService,
    CouponService,
  ],
})
export class BuyerModule {}
