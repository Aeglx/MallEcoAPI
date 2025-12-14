import { Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

interface CacheConfig {
  ttl: number; // 生存时间（秒）
  maxSize?: number; // 最大缓存条目数
  refreshAhead?: boolean; // 预刷新
  compressionEnabled?: boolean; // 是否启用压缩
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
  accessCount: number;
  lastAccess: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  memoryUsage: number;
  hitRate: number;
}

@Injectable()
export class ApiCacheManager {
  private readonly logger = new Logger(ApiCacheManager.name);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    memoryUsage: 0,
    hitRate: 0,
  };
  
  // 预定义的缓存配置
  private readonly defaultConfigs: Record<string, CacheConfig> = {
    // 用户相关缓存
    user_profile: { ttl: 300, maxSize: 10000 }, // 5分钟
    user_permissions: { ttl: 600, maxSize: 5000 }, // 10分钟
    
    // 商品相关缓存
    product_detail: { ttl: 1800, maxSize: 20000 }, // 30分钟
    product_list: { ttl: 300, maxSize: 5000 }, // 5分钟
    product_categories: { ttl: 3600, maxSize: 1000 }, // 1小时
    
    // 分销相关缓存
    distribution_stats: { ttl: 600, maxSize: 10000 }, // 10分钟
    distribution_list: { ttl: 300, maxSize: 5000 }, // 5分钟
    
    // 系统配置缓存
    system_config: { ttl: 3600, maxSize: 100 }, // 1小时
    menu_tree: { ttl: 1800, maxSize: 1000 }, // 30分钟
    
    // API限流缓存
    rate_limit: { ttl: 60, maxSize: 100000 }, // 1分钟
  };

  constructor() {
    // 启动缓存清理定时器
    setInterval(() => this.cleanupExpired(), 30000); // 每30秒清理一次
    setInterval(() => this.updateMetrics(), 60000); // 每分钟更新指标
  }

  /**
   * 获取缓存数据
   */
  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccess = now;
    this.metrics.hits++;

    // 检查是否需要预刷新
    if (this.shouldRefreshAhead(entry, config)) {
      this.scheduleRefresh(key, config);
    }

    return this.decompressData(entry.data, entry);
  }

  /**
   * 设置缓存数据
   */
  async set<T>(key: string, data: T, config?: CacheConfig): Promise<void> {
    const finalConfig = this.getConfig(key, config);
    
    // 检查缓存大小限制
    if (finalConfig.maxSize && this.cache.size >= finalConfig.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data: this.compressData(data, finalConfig),
      timestamp: now,
      ttl: finalConfig.ttl,
      compressed: finalConfig.compressionEnabled,
      accessCount: 0,
      lastAccess: now,
    };

    this.cache.set(key, entry);
    this.metrics.sets++;
    this.metrics.memoryUsage = this.calculateMemoryUsage();
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.deletes++;
      this.metrics.memoryUsage = this.calculateMemoryUsage();
    }
    return deleted;
  }

  /**
   * 批量删除缓存（支持模式匹配）
   */
  async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.metrics.deletes += deletedCount;
    this.metrics.memoryUsage = this.calculateMemoryUsage();
    
    this.logger.log(`删除了 ${deletedCount} 个匹配模式 "${pattern}" 的缓存条目`);
    return deletedCount;
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.metrics.memoryUsage = 0;
    this.logger.log('清空所有缓存');
  }

  /**
   * 获取缓存指标
   */
  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    
    return { ...this.metrics };
  }

  /**
   * 获取缓存状态信息
   */
  getCacheInfo(): any {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: entries.filter(e => now - e.timestamp > e.ttl * 1000).length,
      averageAge: this.calculateAverageAge(entries),
      topAccessed: this.getTopAccessedEntries(10),
      memoryUsage: this.metrics.memoryUsage,
      hitRate: this.metrics.hitRate,
    };
  }

  /**
   * 预热缓存
   */
  async warmup<T>(entries: Array<{ key: string; loader: () => Promise<T>; config?: CacheConfig }>> {
    const promises = entries.map(async ({ key, loader, config }) => {
      try {
        const data = await loader();
        await this.set(key, data, config);
      } catch (error) {
        this.logger.error(`预热缓存失败: ${key}`, error);
      }
    });

    await Promise.all(promises);
    this.logger.log(`完成 ${entries.length} 个缓存条目的预热`);
  }

  /**
   * 获取配置
   */
  private getConfig(key: string, customConfig?: CacheConfig): CacheConfig {
    // 从key推断默认配置
    let defaultConfig = this.defaultConfigs.default;
    
    for (const [pattern, config] of Object.entries(this.defaultConfigs)) {
      if (key.includes(pattern)) {
        defaultConfig = config;
        break;
      }
    }

    return { ...defaultConfig, ...customConfig };
  }

  /**
   * 压缩数据
   */
  private compressData<T>(data: T, config: CacheConfig): T {
    if (!config.compressionEnabled) {
      return data;
    }

    // 简化的压缩实现，实际项目中可以使用更好的压缩算法
    if (typeof data === 'string') {
      return data.length > 100 ? this.simpleCompress(data) : data as T;
    }
    
    return data;
  }

  /**
   * 解压缩数据
   */
  private decompressData<T>(data: T, entry: CacheEntry<T>): T {
    if (!entry.compressed) {
      return data;
    }

    if (typeof data === 'string') {
      return this.simpleDecompress(data as string) as T;
    }
    
    return data;
  }

  /**
   * 简单压缩
   */
  private simpleCompress(str: string): string {
    // 使用简单的重复字符压缩
    return str.replace(/(.)\1+/g, (match, char) => {
      return `${char}${match.length}`;
    });
  }

  /**
   * 简单解压缩
   */
  private simpleDecompress(str: string): string {
    return str.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.substring(1));
      return char.repeat(count);
    });
  }

  /**
   * 检查是否需要预刷新
   */
  private shouldRefreshAhead<T>(entry: CacheEntry<T>, config?: CacheConfig): boolean {
    if (!config?.refreshAhead) {
      return false;
    }

    const now = Date.now();
    const timeRemaining = entry.ttl * 1000 - (now - entry.timestamp);
    const shouldRefresh = timeRemaining < entry.ttl * 500; // 剩余时间小于50%时刷新
    
    return shouldRefresh && entry.accessCount > 0;
  }

  /**
   * 调度刷新（异步执行）
   */
  private scheduleRefresh(key: string, config?: CacheConfig): void {
    setTimeout(async () => {
      // 这里应该通过事件或回调机制触发数据刷新
      this.logger.debug(`缓存预刷新: ${key}`);
    }, 0);
  }

  /**
   * 清理过期条目
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.metrics.memoryUsage = this.calculateMemoryUsage();
      this.logger.debug(`清理了 ${cleanedCount} 个过期缓存条目`);
    }
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(`LRU淘汰缓存: ${oldestKey}`);
    }
  }

  /**
   * 计算内存使用量
   */
  private calculateMemoryUsage(): number {
    // 简化的内存计算
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      const dataSize = JSON.stringify(entry).length;
      totalSize += dataSize * 2; // 考虑内存开销
    }
    
    return totalSize;
  }

  /**
   * 计算平均缓存年龄
   */
  private calculateAverageAge(entries: CacheEntry<any>[]): number {
    if (entries.length === 0) return 0;
    
    const now = Date.now();
    const totalAge = entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0);
    
    return totalAge / entries.length;
  }

  /**
   * 获取访问最多的条目
   */
  private getTopAccessedEntries(limit: number): Array<{ key: string; accessCount: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount);
    
    return entries.slice(0, limit);
  }

  /**
   * 更新指标
   */
  private updateMetrics(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    this.metrics.memoryUsage = this.calculateMemoryUsage();
  }
}