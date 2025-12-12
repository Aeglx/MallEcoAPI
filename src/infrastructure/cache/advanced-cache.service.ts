import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdvancedCacheService implements OnModuleInit {
  private redisClient: Redis;
  private readonly LOCK_PREFIX = 'lock:';
  private readonly CACHE_PREFIX = 'cache:';
  private readonly DEFAULT_LOCK_TIMEOUT = 30000; // 30秒
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB') || 0,
    });
  }

  async onModuleInit() {
    // 应用启动时进行缓存预热
    await this.preheatCache();
  }

  // ==================== 分布式锁实现 ====================

  /**
   * 获取分布式锁
   */
  async acquireLock(
    key: string,
    timeout: number = this.DEFAULT_LOCK_TIMEOUT,
    retryCount: number = 3,
    retryDelay: number = 100
  ): Promise<string | null> {
    const lockKey = `${this.LOCK_PREFIX}${key}`;
    const lockValue = Math.random().toString(36).substring(2) + Date.now().toString();

    for (let i = 0; i < retryCount; i++) {
      const result = await this.redisClient.set(
        lockKey,
        lockValue,
        'PX',
        timeout,
        'NX'
      );

      if (result === 'OK') {
        return lockValue;
      }

      if (i < retryCount - 1) {
        await this.delay(retryDelay);
      }
    }

    return null;
  }

  /**
   * 释放分布式锁
   */
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}${key}`;
    
    // 使用Lua脚本确保原子性操作
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redisClient.eval(luaScript, 1, lockKey, lockValue);
    return result === 1;
  }

  /**
   * 带锁执行函数
   */
  async executeWithLock<T>(
    key: string,
    fn: () => Promise<T>,
    options: {
      timeout?: number;
      retryCount?: number;
      retryDelay?: number;
    } = {}
  ): Promise<T> {
    const lockValue = await this.acquireLock(
      key,
      options.timeout,
      options.retryCount,
      options.retryDelay
    );

    if (!lockValue) {
      throw new Error(`Failed to acquire lock for key: ${key}`);
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(key, lockValue);
    }
  }

  // ==================== 高级缓存策略 ====================

  /**
   * 带锁的缓存获取
   */
  async getWithLock<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<T> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`;
    
    // 尝试从缓存获取
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 使用分布式锁防止缓存击穿
    return this.executeWithLock(
      `cache:${key}`,
      async () => {
        // 双重检查，防止重复计算
        const doubleCheck = await this.redisClient.get(cacheKey);
        if (doubleCheck) {
          return JSON.parse(doubleCheck);
        }

        // 执行回源函数
        const data = await fallbackFn();
        
        // 设置缓存
        await this.redisClient.setex(
          cacheKey,
          ttl,
          JSON.stringify(data)
        );

        return data;
      }
    );
  }

  /**
   * 批量缓存操作
   */
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    const cacheKeys = keys.map(key => `${this.CACHE_PREFIX}${key}`);
    const values = await this.redisClient.mget(...cacheKeys);
    
    const result = new Map<string, T>();
    keys.forEach((key, index) => {
      if (values[index]) {
        result.set(key, JSON.parse(values[index]));
      }
    });
    
    return result;
  }

  /**
   * 批量设置缓存
   */
  async mset(
    data: Map<string, any>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    
    for (const [key, value] of data.entries()) {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      pipeline.setex(cacheKey, ttl, JSON.stringify(value));
    }
    
    await pipeline.exec();
  }

  /**
   * 缓存预热
   */
  private async preheatCache(): Promise<void> {
    const preheatData = [
      { key: 'system:config:base', ttl: 86400 }, // 24小时
      { key: 'system:category:tree', ttl: 3600 }, // 1小时
      { key: 'system:region:all', ttl: 86400 }, // 24小时
    ];

    for (const item of preheatData) {
      try {
        // 这里可以添加具体的预热逻辑
        // 例如从数据库加载配置数据并缓存
        console.log(`Preheating cache: ${item.key}`);
      } catch (error) {
        console.error(`Failed to preheat cache ${item.key}:`, error);
      }
    }
  }

  /**
   * 缓存统计
   */
  async getCacheStats(): Promise<{
    hitCount: number;
    missCount: number;
    hitRate: number;
    totalSize: number;
  }> {
    // 这里可以实现缓存命中率统计
    // 可以使用Redis的INFO命令获取更多统计信息
    return {
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
      totalSize: 0
    };
  }

  /**
   * 清除缓存
   */
  async clearCache(pattern: string = '*'): Promise<number> {
    const keys = await this.redisClient.keys(`${this.CACHE_PREFIX}${pattern}`);
    if (keys.length > 0) {
      return await this.redisClient.del(...keys);
    }
    return 0;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== 缓存模式实现 ====================

  /**
   * 读穿透模式
   */
  async readThrough<T>(
    key: string,
    loader: () => Promise<T>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<T> {
    return this.getWithLock(key, loader, ttl);
  }

  /**
   * 写穿透模式
   */
  async writeThrough<T>(
    key: string,
    data: T,
    writer: (data: T) => Promise<void>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`;
    
    // 先写数据库
    await writer(data);
    
    // 再写缓存
    await this.redisClient.setex(cacheKey, ttl, JSON.stringify(data));
  }

  /**
   * 写回模式
   */
  async writeBack<T>(
    key: string,
    data: T,
    writer: (data: T) => Promise<void>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`;
    
    // 只写缓存，异步写数据库
    await this.redisClient.setex(cacheKey, ttl, JSON.stringify(data));
    
    // 异步写入数据库（可以使用消息队列）
    setImmediate(async () => {
      try {
        await writer(data);
      } catch (error) {
        console.error('Write back failed:', error);
      }
    });
  }
}