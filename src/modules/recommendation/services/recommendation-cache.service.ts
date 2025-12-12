import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class RecommendationCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private generateCacheKey(key: string, params: any = {}): string {
    const paramsStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `recommendation:${key}:${paramsStr}`;
  }

  async getRecommendationsCache(userId: string, limit: number): Promise<any | null> {
    const key = this.generateCacheKey('user-recommendations', { userId, limit });
    return await this.cacheManager.get(key);
  }

  async setRecommendationsCache(userId: string, limit: number, data: any): Promise<void> {
    const key = this.generateCacheKey('user-recommendations', { userId, limit });
    // 缓存1小时
    await this.cacheManager.set(key, data, 3600000);
  }

  async getPopularCache(limit: number): Promise<any | null> {
    const key = this.generateCacheKey('popular-recommendations', { limit });
    return await this.cacheManager.get(key);
  }

  async setPopularCache(limit: number, data: any): Promise<void> {
    const key = this.generateCacheKey('popular-recommendations', { limit });
    // 缓存2小时
    await this.cacheManager.set(key, data, 7200000);
  }

  async clearCache(userId: string): Promise<void> {
    // 清除与该用户相关的所有缓存
    // 注意：由于CacheManager不支持keys方法，这里需要特定的缓存实现
    const key = this.generateCacheKey('user-recommendations', { userId });
    await this.cacheManager.del(key);
  }
}
