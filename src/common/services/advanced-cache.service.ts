import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

interface CacheOptions {
  ttl?: number; // 缓存时间(秒)
  prefix?: string; // 缓存键前缀
  refreshOnAccess?: boolean; // 访问时刷新TTL
  fallback?: () => Promise<any>; // 缓存失效时的回退函数
}

@Injectable()
export class AdvancedCacheService {
  private readonly logger = new Logger(AdvancedCacheService.name);
  private readonly redis: Redis;
  private readonly defaultTtl: number;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.redis = redisClient;
    this.defaultTtl = this.configService.get<number>('cache.ttl') || 3600;
  }

  /**
   * 智能缓存获取
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { prefix = 'cache', refreshOnAccess = false } = options;
    const cacheKey = `${prefix}:${key}`;

    try {
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        // 如果需要访问时刷新TTL
        if (refreshOnAccess) {
          await this.redis.expire(cacheKey, options.ttl || this.defaultTtl);
        }
        
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
      
      this.logger.debug(`Cache miss: ${cacheKey}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * 缓存设置
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const { ttl = this.defaultTtl, prefix = 'cache' } = options;
    const cacheKey = `${prefix}:${key}`;

    try {
      await this.redis.setex(cacheKey, ttl, JSON.stringify(value));
      this.logger.debug(`Cache set: ${cacheKey} with TTL ${ttl}s`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${cacheKey}:`, error);
    }
  }

  /**
   * 智能缓存获取或设置
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行获取函数
    const value = await fetchFn();
    
    // 设置缓存
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * 批量获取缓存
   */
  async mget<T>(keys: string[], prefix: string = 'cache'): Promise<(T | null)[]> {
    const cacheKeys = keys.map(key => `${prefix}:${key}`);
    
    try {
      const values = await this.redis.mget(...cacheKeys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      this.logger.error(`Batch cache get error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置缓存
   */
  async mset<T>(
    keyValuePairs: [string, T][],
    options: CacheOptions = {},
  ): Promise<void> {
    const { ttl = this.defaultTtl, prefix = 'cache' } = options;
    
    const pipeline = this.redis.pipeline();
    
    keyValuePairs.forEach(([key, value]) => {
      const cacheKey = `${prefix}:${key}`;
      pipeline.setex(cacheKey, ttl, JSON.stringify(value));
    });

    try {
      await pipeline.exec();
      this.logger.debug(`Batch cache set: ${keyValuePairs.length} items`);
    } catch (error) {
      this.logger.error(`Batch cache set error:`, error);
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string, prefix: string = 'cache'): Promise<boolean> {
    const cacheKey = `${prefix}:${key}`;
    
    try {
      const result = await this.redis.del(cacheKey);
      this.logger.debug(`Cache deleted: ${cacheKey}`);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache delete error for key ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * 批量删除缓存
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.redis.del(...keys);
      this.logger.debug(`Deleted ${result} cache keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      this.logger.error(`Delete by pattern error:`, error);
      return 0;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const info = await this.redis.info('stats');
      const keys = await this.redis.keys('cache:*');
      
      // 解析Redis统计信息
      const totalKeys = keys.length;
      const memoryUsage = this.parseMemoryUsage(info);
      const hitRate = this.parseHitRate(info);
      
      return {
        totalKeys,
        memoryUsage,
        hitRate,
      };
    } catch (error) {
      this.logger.error('Get cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: '0',
        hitRate: 0,
      };
    }
  }

  /**
   * 清除所有缓存
   */
  async clearAll(): Promise<number> {
    try {
      const keys = await this.redis.keys('cache:*');
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.redis.del(...keys);
      this.logger.log(`Cleared all cache: ${result} keys deleted`);
      return result;
    } catch (error) {
      this.logger.error('Clear all cache error:', error);
      return 0;
    }
  }

  private parseMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:(\S+)/);
    return match ? match[1] : '0';
  }

  private parseHitRate(info: string): number {
    const keyspaceHits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
    const keyspaceMisses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
    
    const total = keyspaceHits + keyspaceMisses;
    return total > 0 ? (keyspaceHits / total) * 100 : 0;
  }
}