import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { BusinessMetric } from './entities/business-metric.entity';
import { Dashboard } from './entities/dashboard.entity';
import { Report } from './entities/report.entity';
import { RedisModule } from '../../common/redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessMetric, Dashboard, Report]),
    RedisModule,
    CacheModule.register(),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}