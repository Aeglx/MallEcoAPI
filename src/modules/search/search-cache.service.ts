import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class SearchCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 生成搜索缓存键
   */
  private generateCacheKey(key: string, params: any = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&');
    
    return `search:${key}:${paramString}`;
  }

  /**
   * 获取热门搜索词缓存
   */
  async getHotWordsCache(limit: number): Promise<string[] | null> {
    const cacheKey = this.generateCacheKey('hot-words', { limit });
    return this.cacheManager.get<string[]>(cacheKey);
  }

  /**
   * 设置热门搜索词缓存
   */
  async setHotWordsCache(limit: number, data: string[]): Promise<void> {
    const cacheKey = this.generateCacheKey('hot-words', { limit });
    await this.cacheManager.set(cacheKey, data, 300); // 5分钟缓存
  }

  /**
   * 获取搜索建议缓存
   */
  async getSuggestionsCache(keyword: string, limit: number): Promise<string[] | null> {
    const cacheKey = this.generateCacheKey('suggestions', { keyword, limit });
    return this.cacheManager.get<string[]>(cacheKey);
  }

  /**
   * 设置搜索建议缓存
   */
  async setSuggestionsCache(keyword: string, limit: number, data: string[]): Promise<void> {
    const cacheKey = this.generateCacheKey('suggestions', { keyword, limit });
    await this.cacheManager.set(cacheKey, data, 180); // 3分钟缓存
  }

  /**
   * 获取搜索结果缓存
   */
  async getSearchResultsCache(
    keyword: string,
    page: number,
    pageSize: number,
    filters: any
  ): Promise<any | null> {
    const cacheKey = this.generateCacheKey('results', { keyword, page, pageSize, ...filters });
    return this.cacheManager.get<any>(cacheKey);
  }

  /**
   * 设置搜索结果缓存
   */
  async setSearchResultsCache(
    keyword: string,
    page: number,
    pageSize: number,
    filters: any,
    data: any
  ): Promise<void> {
    const cacheKey = this.generateCacheKey('results', { keyword, page, pageSize, ...filters });
    await this.cacheManager.set(cacheKey, data, 60); // 1分钟缓存
  }

  /**
   * 获取搜索统计缓存
   */
  async getStatisticsCache(type: string, params: any): Promise<any | null> {
    const cacheKey = this.generateCacheKey('statistics', { type, ...params });
    return this.cacheManager.get<any>(cacheKey);
  }

  /**
   * 设置搜索统计缓存
   */
  async setStatisticsCache(type: string, params: any, data: any): Promise<void> {
    const cacheKey = this.generateCacheKey('statistics', { type, ...params });
    await this.cacheManager.set(cacheKey, data, 600); // 10分钟缓存
  }

  /**
   * 清除特定关键词的缓存
   */
  async clearKeywordCache(keyword: string): Promise<void> {
    // 清除所有与该关键词相关的缓存
    const pattern = `search:*:keyword=${keyword}*`;
    const keys = await this.cacheManager.store.keys();
    
    for (const key of keys) {
      if (key.includes(`keyword=${keyword}`)) {
        await this.cacheManager.del(key);
      }
    }
  }

  /**
   * 清除所有搜索缓存
   */
  async clearAllCache(): Promise<void> {
    const keys = await this.cacheManager.store.keys();
    
    for (const key of keys) {
      if (key.startsWith('search:')) {
        await this.cacheManager.del(key);
      }
    }
  }
}