import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

/**
 * 缓存保护服务
 * 防止缓存穿透、缓存雪崩等问题
 * 参考：MallEcoPro/src/infrastructure/cache/cache-protection.service.ts
 */
@Injectable()
export class CacheProtectionService {
  private readonly logger = new Logger(CacheProtectionService.name);
  private readonly NULL_VALUE_MARKER = '__NULL__'; // 空值标记

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * 防止缓存穿透
   * 使用空值缓存策略
   */
  async getWithPenetrationProtection<T>(
    key: string,
    loader: () => Promise<T | null>,
    ttl: number = 300,
  ): Promise<T | null> {
    // 1. 先查缓存
    const cached = await this.cacheManager.get<T | string>(key);
    if (cached !== undefined && cached !== null) {
      // 检查是否是空值标记
      if (cached === this.NULL_VALUE_MARKER) {
        return null; // 返回null，表示数据不存在（已缓存空值）
      }
      return cached as T;
    }

    // 2. 缓存未命中，从数据源加载
    try {
      const value = await loader();

      // 3. 写入缓存（包括空值）
      if (value === null || value === undefined) {
        // 空值也缓存，但时间较短，防止缓存穿透
        await this.cacheManager.set(key, this.NULL_VALUE_MARKER, Math.min(ttl, 60) * 1000); // 空值最多缓存60秒
        this.logger.debug(`Cached null value for key: ${key}`);
      } else {
        await this.setWithAvalancheProtection(key, value, ttl);
      }

      return value;
    } catch (error) {
      this.logger.error(`Error loading data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 防止缓存雪崩
   * 使用随机过期时间
   */
  async setWithAvalancheProtection(
    key: string,
    value: any,
    baseTtl: number,
    randomRange: number = 0.2, // 20%的随机范围
  ): Promise<void> {
    // 计算随机过期时间：baseTtl ± (baseTtl * randomRange * random)
    const randomFactor = 1 + (Math.random() * 2 - 1) * randomRange; // 0.8 到 1.2
    const ttl = Math.floor(baseTtl * randomFactor);

    await this.cacheManager.set(key, value, ttl * 1000); // CacheManager使用毫秒
    this.logger.debug(`Cached with avalanche protection: ${key}, ttl: ${ttl}s`);
  }

  /**
   * 批量获取（带穿透保护）
   */
  async multiGetWithProtection<T>(
    keys: string[],
    loader: (missingKeys: string[]) => Promise<Map<string, T | null>>,
    ttl: number = 300,
  ): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    const missingKeys: string[] = [];

    // 1. 批量从缓存获取
    for (const key of keys) {
      const cached = await this.cacheManager.get<T | string>(key);
      if (cached !== undefined && cached !== null) {
        if (cached === this.NULL_VALUE_MARKER) {
          result.set(key, null);
        } else {
          result.set(key, cached as T);
        }
      } else {
        missingKeys.push(key);
      }
    }

    // 2. 如果有未命中的，从数据源加载
    if (missingKeys.length > 0) {
      const loadedValues = await loader(missingKeys);

      // 3. 写入缓存
      for (const [key, value] of loadedValues.entries()) {
        result.set(key, value);
        if (value === null || value === undefined) {
          await this.cacheManager.set(key, this.NULL_VALUE_MARKER, Math.min(ttl, 60) * 1000);
        } else {
          await this.setWithAvalancheProtection(key, value, ttl);
        }
      }
    }

    return result;
  }

  /**
   * 热点数据永不过期（需要手动更新）
   */
  async setHotspotData(key: string, value: any): Promise<void> {
    // 设置一个很长的过期时间（30天），实际使用时需要手动更新
    await this.cacheManager.set(key, value, 30 * 24 * 3600 * 1000);
    this.logger.debug(`Set hotspot data: ${key}`);
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.logger.debug(`Deleted cache: ${key}`);
  }

  /**
   * 批量删除缓存
   */
  async deleteBatch(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
    this.logger.debug(`Deleted batch cache: ${keys.length} keys`);
  }
}

