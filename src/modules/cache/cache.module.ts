import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheOptimizationController } from './controllers/cache-optimization.controller';
import { CacheOptimizationService } from './services/cache-optimization.service';
import { CacheAnalysisService } from './services/cache-analysis.service';
import { CachePerformanceEntity } from './entities/cache-performance.entity';
import { CacheConfigEntity } from './entities/cache-config.entity';
import { CacheInvalidationEntity } from './entities/cache-invalidation.entity';

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