import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheAdapter } from './redis-cache-adapter.service';

interface DistributedCacheOptions {
  ttl?: number;
  version?: string;
  compress?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface CacheEntry<T> {
  data: T;
  version: string;
  timestamp: number;
  ttl: number;
  compressed: boolean;
  accessCount: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  memoryUsage: number;
  hitRate: number;
  distributedHits: number;
}

@Injectable()
export class DistributedCacheService {
  private readonly logger = new Logger(DistributedCacheService.name);
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    memoryUsage: 0,
    hitRate: 0,
    distributedHits: 0,
  };

  // 缓存版本管理
  private readonly cacheVersions = new Map<string, string>();
  
  // 本地缓存（作为L1缓存）
  private readonly l1Cache = new Map<string, CacheEntry<any>>();
  
  // 缓存优先级配置
  private readonly priorityTTL = {
    HIGH: 3600,    // 1小时
    MEDIUM: 1800,  // 30分钟
    LOW: 300,       // 5分钟
  };

  constructor(private readonly redisAdapter: RedisCacheAdapter) {}

  /**
   * 获取缓存数据（多级缓存）
   */
  async get<T>(key: string, options: DistributedCacheOptions = {}): Promise<T | null> {
    // L1缓存查找
    const l1Result = await this.getFromL1Cache<T>(key);
    if (l1Result !== null) {
      this.metrics.hits++;
      return l1Result;
    }

    // L2缓存（Redis）查找
    const l2Result = await this.getFromL2Cache<T>(key, options);
    if (l2Result !== null) {
      this.metrics.distributedHits++;
      
      // 回填L1缓存
      await this.setToL1Cache(key, l2Result, options);
      
      return l2Result;
    }

    this.metrics.misses++;
    return null;
  }

  /**
   * 设置缓存数据（多级缓存）
   */
  async set<T>(
    key: string, 
    data: T, 
    options: DistributedCacheOptions = {}
  ): Promise<boolean> {
    const finalOptions = this.resolveOptions(options);
    
    try {
      // 并行设置L1和L2缓存
      await Promise.all([
        this.setToL1Cache(key, data, finalOptions),
        this.setToL2Cache(key, data, finalOptions),
      ]);

      this.metrics.sets++;
      return true;
    } catch (error) {
      this.logger.error(`设置分布式缓存失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      // 并行删除L1和L2缓存
      const [l1Deleted, l2Deleted] = await Promise.all([
        this.deleteFromL1Cache(key),
        this.deleteFromL2Cache(key),
      ]);

      const deleted = l1Deleted || l2Deleted;
      if (deleted) {
        this.metrics.deletes++;
      }
      
      return deleted;
    } catch (error) {
      this.logger.error(`删除分布式缓存失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 批量删除缓存
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      // 删除L1缓存
      let l1Deleted = 0;
      const regex = new RegExp(pattern.replace('*', '.*'));
      
      for (const key of this.l1Cache.keys()) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          l1Deleted++;
        }
      }

      // 删除L2缓存
      const l2Deleted = await this.redisAdapter.deletePattern(pattern);
      
      const totalDeleted = l1Deleted + l2Deleted;
      this.metrics.deletes += totalDeleted;
      
      this.logger.log(`删除了 ${totalDeleted} 个匹配模式 "${pattern}" 的缓存条目 (L1: ${l1Deleted}, L2: ${l2Deleted})`);
      
      return totalDeleted;
    } catch (error) {
      this.logger.error(`批量删除分布式缓存失败: ${pattern}`, error);
      return 0;
    }
  }

  /**
   * 原子递增操作
   */
  async incr(key: string, amount: number = 1, ttl?: number): Promise<number> {
    try {
      const result = await this.redisAdapter.incr(key, amount);
      
      // 如果指定了TTL，设置过期时间
      if (ttl) {
        await this.redisAdapter.expire(key, ttl);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`分布式递增失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 原子递减操作
   */
  async decr(key: string, amount: number = 1, ttl?: number): Promise<number> {
    try {
      const result = await this.redisAdapter.decr(key, amount);
      
      // 如果指定了TTL，设置过期时间
      if (ttl) {
        await this.redisAdapter.expire(key, ttl);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`分布式递减失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取并设置（原子操作）
   */
  async getAndSet<T>(
    key: string, 
    value: T, 
    options: DistributedCacheOptions = {}
  ): Promise<T | null> {
    try {
      const currentValue = await this.get<T>(key, options);
      await this.set(key, value, options);
      return currentValue;
    } catch (error) {
      this.logger.error(`getAndSet操作失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 缓存版本管理 - 增加版本
   */
  async incrementVersion(pattern: string): Promise<string> {
    const currentVersion = this.cacheVersions.get(pattern) || '0';
    const newVersion = (parseInt(currentVersion) + 1).toString();
    this.cacheVersions.set(pattern, newVersion);
    
    // 同时存储到Redis中，确保集群间同步
    await this.redisAdapter.set(`version:${pattern}`, newVersion, 86400); // 24小时
    
    return newVersion;
  }

  /**
   * 获取缓存版本
   */
  async getVersion(pattern: string): Promise<string> {
    let version = this.cacheVersions.get(pattern);
    
    if (!version) {
      // 从Redis获取版本
      version = await this.redisAdapter.get<string>(`version:${pattern}`) || '0';
      this.cacheVersions.set(pattern, version);
    }
    
    return version;
  }

  /**
   * 带版本的缓存键
   */
  async getVersionedKey(key: string, pattern: string): Promise<string> {
    const version = await this.getVersion(pattern);
    return `${key}:v:${version}`;
  }

  /**
   * 缓存预热
   */
  async warmup(entries: Array<{
    key: string;
    loader: () => Promise<any>;
    options?: DistributedCacheOptions;
  }>): Promise<void> {
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async ({ key, loader, options }) => {
        try {
          const data = await loader();
          await this.set(key, data, options);
        } catch (error) {
          this.logger.error(`缓存预热失败: ${key}`, error);
        }
      });

      await Promise.all(promises);
      this.logger.debug(`完成了一批缓存预热 (${batch.length} 个条目)`);
      
      // 批次间稍微延迟，避免压力过大
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(`完成 ${entries.length} 个缓存条目的预热`);
  }

  /**
   * 获取分布式缓存指标
   */
  async getMetrics(): Promise<CacheMetrics> {
    // 获取Redis健康状态
    const redisHealth = await this.redisAdapter.healthCheck();
    
    // 计算命中率
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    
    return {
      ...this.metrics,
      redisStatus: redisHealth.status,
      redisDetails: redisHealth.details,
      l1CacheSize: this.l1Cache.size,
      l2CacheAvailable: redisHealth.status === 'UP',
    } as any;
  }

  /**
   * 清理L1缓存
   */
  async clearL1Cache(): Promise<void> {
    this.l1Cache.clear();
    this.logger.log('清空L1缓存');
  }

  /**
   * 从L1缓存获取
   */
  private async getFromL1Cache<T>(key: string): Promise<T | null> {
    const entry = this.l1Cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // 检查过期
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.l1Cache.delete(key);
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccess = now;
    
    return entry.data;
  }

  /**
   * 从L2缓存获取
   */
  private async getFromL2Cache<T>(key: string, options: DistributedCacheOptions): Promise<T | null> {
    const versionedKey = options.version 
      ? `${key}:v:${options.version}`
      : key;
    
    return await this.redisAdapter.get<T>(versionedKey);
  }

  /**
   * 设置L1缓存
   */
  private async setToL1Cache<T>(
    key: string, 
    data: T, 
    options: DistributedCacheOptions
  ): Promise<void> {
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      version: options.version || '1',
      timestamp: now,
      ttl: options.ttl || this.priorityTTL[options.priority || 'MEDIUM'],
      compressed: options.compress || false,
      accessCount: 0,
    };

    this.l1Cache.set(key, entry);
  }

  /**
   * 设置L2缓存
   */
  private async setToL2Cache<T>(
    key: string, 
    data: T, 
    options: DistributedCacheOptions
  ): Promise<void> {
    const versionedKey = options.version 
      ? `${key}:v:${options.version}`
      : key;
    
    await this.redisAdapter.set(versionedKey, data, options.ttl);
  }

  /**
   * 从L1缓存删除
   */
  private async deleteFromL1Cache(key: string): Promise<boolean> {
    return this.l1Cache.delete(key);
  }

  /**
   * 从L2缓存删除
   */
  private async deleteFromL2Cache(key: string): Promise<boolean> {
    return await this.redisAdapter.delete(key);
  }

  /**
   * 解析缓存选项
   */
  private resolveOptions(options: DistributedCacheOptions): Required<DistributedCacheOptions> {
    return {
      ttl: options.ttl || this.priorityTTL[options.priority || 'MEDIUM'],
      version: options.version || '1',
      compress: options.compress || false,
      priority: options.priority || 'MEDIUM',
    };
  }
}