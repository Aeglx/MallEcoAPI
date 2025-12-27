import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

/**
 * 缓存监控服务
 * 监控缓存命中率、缓存使用情况等
 */
@Injectable()
export class CacheMonitorService {
  private readonly logger = new Logger(CacheMonitorService.name);
  private hitCount = 0;
  private missCount = 0;
  private readonly cacheStats = new Map<string, { hits: number; misses: number }>();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * 记录缓存命中
   */
  recordHit(key: string): void {
    this.hitCount++;
    this.updateKeyStats(key, true);
  }

  /**
   * 记录缓存未命中
   */
  recordMiss(key: string): void {
    this.missCount++;
    this.updateKeyStats(key, false);
  }

  /**
   * 更新key级别的统计
   */
  private updateKeyStats(key: string, isHit: boolean): void {
    const prefix = this.getKeyPrefix(key);
    if (!this.cacheStats.has(prefix)) {
      this.cacheStats.set(prefix, { hits: 0, misses: 0 });
    }
    const stats = this.cacheStats.get(prefix)!;
    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
  }

  /**
   * 获取key前缀（用于统计分类）
   */
  private getKeyPrefix(key: string): string {
    const parts = key.split(':');
    return parts.length > 1 ? parts[0] : 'unknown';
  }

  /**
   * 获取缓存命中率
   */
  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    if (total === 0) {
      return 0;
    }
    return (this.hitCount / total) * 100;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    totalRequests: number;
    keyStats: Array<{ prefix: string; hits: number; misses: number; hitRate: number }>;
  } {
    const total = this.hitCount + this.missCount;
    const keyStats = Array.from(this.cacheStats.entries()).map(([prefix, stats]) => ({
      prefix,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits + stats.misses > 0 ? (stats.hits / (stats.hits + stats.misses)) * 100 : 0,
    }));

    return {
      hitRate: this.getHitRate(),
      totalHits: this.hitCount,
      totalMisses: this.missCount,
      totalRequests: total,
      keyStats,
    };
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
    this.cacheStats.clear();
    this.logger.log('Cache statistics reset');
  }

  /**
   * 打印统计报告
   */
  printReport(): void {
    const stats = this.getStats();
    this.logger.log('=== Cache Statistics Report ===');
    this.logger.log(`Overall Hit Rate: ${stats.hitRate.toFixed(2)}%`);
    this.logger.log(`Total Hits: ${stats.totalHits}`);
    this.logger.log(`Total Misses: ${stats.totalMisses}`);
    this.logger.log(`Total Requests: ${stats.totalRequests}`);
    this.logger.log('--- Key Prefix Statistics ---');
    stats.keyStats.forEach(keyStat => {
      this.logger.log(
        `${keyStat.prefix}: ${keyStat.hitRate.toFixed(2)}% (${keyStat.hits}/${keyStat.hits + keyStat.misses})`,
      );
    });
  }
}
