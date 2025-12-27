import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheProtectionService } from './cache/cache-protection.service';
import { CacheWarmupService } from './cache/cache-warmup.service';
import { CacheMonitorService } from '../shared/monitoring/cache-monitor.service';
import { DatabaseQueryOptimizerService } from '../shared/monitoring/database-query-optimizer.service';
import { QueryPerformanceService } from '../shared/monitoring/query-performance.service';

/**
 * 基础设施模块
 * 提供缓存、监控等基础设施服务
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 默认5分钟
      max: 100, // 最大缓存项数
    }),
  ],
  providers: [
    CacheProtectionService,
    CacheWarmupService,
    CacheMonitorService,
    DatabaseQueryOptimizerService,
    QueryPerformanceService,
  ],
  exports: [
    CacheProtectionService,
    CacheWarmupService,
    CacheMonitorService,
    DatabaseQueryOptimizerService,
    QueryPerformanceService,
  ],
})
export class InfrastructureModule {}
