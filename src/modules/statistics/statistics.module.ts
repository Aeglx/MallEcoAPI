import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

// 实体导入
import { SalesStatistics } from './entities/sales-statistics.entity';
import { UserStatistics } from './entities/user-statistics.entity';
import { OrderStatistics } from './entities/order-statistics.entity';
import { FinancialStatistics } from './entities/financial-statistics.entity';

// 服务导入
import { SalesStatisticsService } from './services/sales-statistics.service';
import { UserStatisticsService } from './services/user-statistics.service';
import { OrderStatisticsService } from './services/order-statistics.service';
import { FinancialStatisticsService } from './services/financial-statistics.service';
import { DashboardService } from './services/dashboard.service';

// 控制器导入
import { SalesStatisticsController } from './controllers/sales-statistics.controller';
import { UserStatisticsController } from './controllers/user-statistics.controller';
import { OrderStatisticsController } from './controllers/order-statistics.controller';
import { FinancialStatisticsController } from './controllers/financial-statistics.controller';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesStatistics,
      UserStatistics,
      OrderStatistics,
      FinancialStatistics,
    ]),
    ElasticsearchModule,
  ],
  controllers: [
    SalesStatisticsController,
    UserStatisticsController,
    OrderStatisticsController,
    FinancialStatisticsController,
    DashboardController,
  ],
  providers: [
    SalesStatisticsService,
    UserStatisticsService,
    OrderStatisticsService,
    FinancialStatisticsService,
    DashboardService,
  ],
  exports: [
    SalesStatisticsService,
    UserStatisticsService,
    OrderStatisticsService,
    FinancialStatisticsService,
    DashboardService,
  ],
})
export class StatisticsModule {}