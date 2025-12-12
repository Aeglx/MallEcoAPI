import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheOptimizationController } from './controller./infrastructure/cache-optimization.controller';
import { CacheOptimizationService } from './service./infrastructure/cache-optimization.service';
import { CacheAnalysisService } from './service./infrastructure/cache-analysis.service';
import { CachePerformanceEntity } from './entitie./infrastructure/cache-performance.entity';
import { CacheConfigEntity } from './entitie./infrastructure/cache-config.entity';
import { CacheInvalidationEntity } from './entitie./infrastructure/cache-invalidation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    CachePerformanceEntity,
    CacheConfigEntity,
    CacheInvalidationEntity
  ])],
  controllers: [CacheOptimizationController],
  providers: [CacheOptimizationService, CacheAnalysisService],
  exports: [CacheOptimizationService, CacheAnalysisService]
})
export class CacheModule {}
