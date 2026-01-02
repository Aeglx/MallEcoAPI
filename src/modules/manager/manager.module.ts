import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ManagerStatisticsController } from './controllers/statistics/statistics.controller';
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
import { ManagerPermissionController } from './controllers/permission/permission.controller';
import { MenuModule } from '../menu/menu.module';
import { Member } from '../framework/entities/member.entity';
import { MemberGrade } from '../framework/entities/grade.entity';
import { MemberAddress } from '../framework/entities/address.entity';
import { PointsGoods } from '../framework/entities/points-goods.entity';
import { PointsOrder } from '../framework/entities/points-order.entity';
import { PointsRecord } from '../framework/entities/points-record.entity';
import { PointsCategory } from '../framework/entities/points-category.entity';
import { PointsGoodsController } from './controllers/points/points-goods.controller';
import { PointsOrderController } from './controllers/points/points-order.controller';
import { PointsRecordController } from './controllers/points/points-record.controller';
import { PointsCategoryController } from './controllers/points/points-category.controller';
import { PointsGoodsService } from './services/points/points-goods.service';
import { PointsOrderService } from './services/points/points-order.service';
import { PointsRecordService } from './services/points/points-record.service';
import { PointsCategoryService } from './services/points/points-category.service';

@Module({
  imports: [
    ConfigModule,
    MenuModule,
    TypeOrmModule.forFeature([
      Member,
      MemberGrade,
      MemberAddress,
      PointsGoods,
      PointsOrder,
      PointsRecord,
      PointsCategory,
    ]),
  ],
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
    ManagerStatisticsController,
    ManagerPassportController,
    ManagerPermissionController,
    PointsGoodsController,
    PointsOrderController,
    PointsRecordController,
    PointsCategoryController,
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
    PassportService,
    PointsGoodsService,
    PointsOrderService,
    PointsRecordService,
    PointsCategoryService,
  ],
  exports: [],
})
export class ManagerModule {}
