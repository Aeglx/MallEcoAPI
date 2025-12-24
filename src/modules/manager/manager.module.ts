import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportService } from '../passport/passport.service';
import { GoodsController } from './controllers/goods/goods.controller';
import { CategoryController } from './controllers/goods/category.controller';
import { BrandController } from './controllers/goods/brand.controller';
import { MemberController } from './controllers/member/member.controller';
import { GradeController } from './controllers/member/grade.controller';
import { OrderController } from './controllers/order/order.controller';
import { PromotionController } from './controllers/promotion/promotion.controller';
import { SystemSettingController } from './controllers/setting/system.controller';
import { DashboardController } from './controllers/statistics/dashboard.controller';
import { ManagerPassportController } from './controllers/passport/passport.controller';
import { GoodsService } from './services/goods/goods.service';
import { CategoryService } from './services/goods/category.service';
import { BrandService } from './services/goods/brand.service';
import { MemberService } from './services/member/member.service';
import { GradeService } from './services/member/grade.service';
import { OrderService } from './services/order/order.service';
import { PromotionService } from './services/promotion/promotion.service';
import { SystemSettingService } from './services/setting/system.service';
import { DashboardService } from './services/statistics/dashboard.service';

@Module({
  imports: [ConfigModule],
  controllers: [
    GoodsController,
    CategoryController,
    BrandController,
    MemberController,
    GradeController,
    OrderController,
    PromotionController,
    SystemSettingController,
    DashboardController,
    ManagerPassportController
  ],
  providers: [
    GoodsService,
    CategoryService,
    BrandService,
    MemberService,
    GradeService,
    OrderService,
    PromotionService,
    SystemSettingService,
    DashboardService,
    PassportService
  ],
  exports: [],
})
export class ManagerModule {}