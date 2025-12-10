import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/database/db-connection.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticsearchProductService } from '../../products/elasticsearch.service';
import { SearchCacheService } from './search-cache.service';
import { SearchStatisticsDto, SearchTrendResponseDto, HotWordStatisticsResponseDto } from './dto/search-statistics.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly dbConnectionService: DbConnectionService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly elasticsearchProductService: ElasticsearchProductService,
    private readonly searchCacheService: SearchCacheService
  ) {}

  /**
   * 获取热门搜索关键词
   */
  async getHotWords(limit: number = 10): Promise<string[]> {
    // 尝试从缓存获取
    const cachedData = await this.searchCacheService.getHotWordsCache(limit);
    if (cachedData) {
      return cachedData;
    }

    const sql = `
      SELECT keyword 
      FROM mall_hot_words 
      WHERE delete_flag = 0 
      ORDER BY sort DESC, id DESC 
      LIMIT ?
    `;
    
    const rows = await this.dbConnectionService.query(sql, [limit]);
    const result = rows.map((row: any) => row.keyword);
    
    // 设置缓存
    await this.searchCacheService.setHotWordsCache(limit, result);
    
    return result;
  }

  /**
   * 保存搜索历史
   */
  async saveSearchHistory(userId: string, keyword: string): Promise<void> {
    // 检查是否已存在相同的搜索历史
    const checkSql = `
      SELECT id 
      FROM mall_search_history 
      WHERE user_id = ? AND keyword = ? AND delete_flag = 0
    `;
    
    const existing = await this.dbConnectionService.queryOne(checkSql, [userId, keyword]);
    
    if (existing) {
      // 如果存在，更新搜索时间
      const updateSql = `
        UPDATE mall_search_history 
        SET create_time = NOW(), update_time = NOW() 
        WHERE id = ?
      `;
      await this.dbConnectionService.query(updateSql, [existing.id]);
    } else {
      // 如果不存在，插入新记录
      const insertSql = `
        INSERT INTO mall_search_history (user_id, keyword, create_time, update_time, delete_flag) 
        VALUES (?, ?, NOW(), NOW(), 0)
      `;
      await this.dbConnectionService.query(insertSql, [userId, keyword]);
    }
    
    // 保持每个用户的搜索历史不超过20条
    const cleanupSql = `
      DELETE FROM mall_search_history 
      WHERE user_id = ? 
      AND id NOT IN (
        SELECT id FROM (
          SELECT id FROM mall_search_history 
          WHERE user_id = ? AND delete_flag = 0 
          ORDER BY create_time DESC 
          LIMIT 20
        ) AS latest
      )
    `;
    await this.dbConnectionService.query(cleanupSql, [userId, userId]);
  }

  /**
   * 获取搜索历史
   */
  async getSearchHistory(userId: string, limit: number = 20): Promise<string[]> {
    const sql = `
      SELECT keyword 
      FROM mall_search_history 
      WHERE user_id = ? AND delete_flag = 0 
      ORDER BY create_time DESC 
      LIMIT ?
    `;
    
    const rows = await this.dbConnectionService.query(sql, [userId, limit]);
    return rows.map((row: any) => row.keyword);
  }

  /**
   * 清除搜索历史
   */
  async clearSearchHistory(userId: string): Promise<void> {
    const sql = `
      UPDATE mall_search_history 
      SET delete_flag = 1, update_time = NOW() 
      WHERE user_id = ?
    `;
    await this.dbConnectionService.query(sql, [userId]);
  }

  /**
   * 获取搜索联想
   */
  async getSearchSuggestions(keyword: string, limit: number = 10): Promise<string[]> {
    if (!keyword.trim()) {
      return [];
    }

    // 尝试从缓存获取
    const cachedData = await this.searchCacheService.getSuggestionsCache(keyword, limit);
    if (cachedData) {
      return cachedData;
    }

    try {
      // 使用Elasticsearch的completion suggester获取搜索建议
      const response = await this.elasticsearchService.search({
        index: 'products',
        body: {
          suggest: {
            product_suggestions: {
              prefix: keyword,
              completion: {
                field: 'name.suggest',
                size: limit,
                skip_duplicates: true
              }
            }
          }
        }
      } as any);

      // 处理Elasticsearch建议结果
      if (response.suggest && response.suggest.product_suggestions) {
        const suggestions = response.suggest.product_suggestions[0].options.map((option: any) => option.text);
        if (suggestions.length > 0) {
          // 设置缓存
          await this.searchCacheService.setSuggestionsCache(keyword, limit, suggestions);
          return suggestions;
        }
      }
    } catch (error) {
      // 如果Elasticsearch建议失败，回退到数据库查询
      console.warn('Elasticsearch suggestions failed, falling back to database query:', error);
    }

    // 从商品表中获取相关关键词（回退方案）
    const productSql = `
      SELECT DISTINCT name 
      FROM mall_product 
      WHERE delete_flag = 0 AND market_enable = 1 
      AND name LIKE ? 
      ORDER BY sale_num DESC, id DESC 
      LIMIT ?
    `;
    
    const rows = await this.dbConnectionService.query(productSql, [`%${keyword}%`, limit]);
    const result = rows.map((row: any) => row.name);
    
    // 设置缓存
    await this.searchCacheService.setSuggestionsCache(keyword, limit, result);
    
    return result;
  }

  /**
   * 搜索商品
   */
  async searchProducts(
    keyword: string,
    page: number = 1,
    pageSize: number = 10,
    categoryId?: string,
    brandId?: string,
    minPrice?: number,
    maxPrice?: number,
    isNew?: number,
    isHot?: number,
    recommend?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<any> {
    // 构建搜索参数
    const filters = { categoryId, brandId, minPrice, maxPrice, isNew, isHot, recommend, sortBy, sortOrder };
    
    // 尝试从缓存获取
    const cachedData = await this.searchCacheService.getSearchResultsCache(keyword, page, pageSize, filters);
    if (cachedData) {
      return cachedData;
    }

    // 使用Elasticsearch进行商品搜索
    const searchResult = await this.elasticsearchProductService.search({
      keyword,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      isNew,
      isHot,
      recommend,
      page,
      limit: pageSize
    });

    // 如果有搜索关键词，保存到搜索历史
    if (keyword) {
      // 记录搜索日志
      await this.updateHotWordSearchCount(keyword);
      
      // 记录搜索统计
      await this.recordSearchLog('system', keyword, 1);
    }

    const result = {
      products: searchResult.data,
      total: searchResult.total,
      page,
      pageSize,
      totalPages: Math.ceil(searchResult.total / pageSize)
    };

    // 设置缓存（只缓存热门搜索词的结果）
    if (keyword && keyword.length > 2) {
      await this.searchCacheService.setSearchResultsCache(keyword, page, pageSize, filters, result);
    }

    return result;
  }

  /**
   * 更新热门搜索词的搜索次数
   */
  private async updateHotWordSearchCount(keyword: string): Promise<void> {
    // 检查热门搜索词是否存在
    const checkSql = `
      SELECT id, search_count 
      FROM mall_hot_words 
      WHERE keyword = ? AND delete_flag = 0
    `;
    
    const existing = await this.dbConnectionService.queryOne(checkSql, [keyword]);
    
    if (existing) {
      // 如果存在，增加搜索次数
      const updateSql = `
        UPDATE mall_hot_words 
        SET search_count = search_count + 1, update_time = NOW() 
        WHERE id = ?
      `;
      await this.dbConnectionService.query(updateSql, [existing.id]);
    } else {
      // 如果不存在，插入新记录
      const insertSql = `
        INSERT INTO mall_hot_words (keyword, search_count, sort, create_time, update_time, delete_flag) 
        VALUES (?, 1, 0, NOW(), NOW(), 0)
      `;
      await this.dbConnectionService.query(insertSql, [keyword]);
    }
  }

  /**
   * 获取搜索趋势统计
   */
  async getSearchTrend(searchStatisticsDto: SearchStatisticsDto): Promise<SearchTrendResponseDto[]> {
    const { startDate, endDate, type = 'daily' } = searchStatisticsDto;
    
    // 尝试从缓存获取
    const cacheKey = { type, startDate, endDate };
    const cachedData = await this.searchCacheService.getStatisticsCache('trend', cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    let dateFormat = '%Y-%m-%d';
    
    if (type === 'weekly') {
      dateFormat = '%Y-%u';
    } else if (type === 'monthly') {
      dateFormat = '%Y-%m';
    }

    const whereClause = startDate && endDate ? 
      `WHERE DATE(create_time) BETWEEN '${startDate}' AND '${endDate}'` : 
      `WHERE create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;

    const sql = `
      SELECT 
        DATE_FORMAT(create_time, '${dateFormat}') as date,
        COUNT(*) as searchCount,
        COUNT(DISTINCT user_id) as userCount,
        AVG(search_depth) as avgSearchDepth
      FROM mall_search_log 
      ${whereClause}
      AND delete_flag = 0
      GROUP BY DATE_FORMAT(create_time, '${dateFormat}')
      ORDER BY date ASC
    `;

    const rows = await this.dbConnectionService.query(sql);
    const result = rows.map((row: any) => ({
      date: row.date,
      searchCount: row.searchCount,
      userCount: row.userCount,
      avgSearchDepth: row.avgSearchDepth || 0
    }));
    
    // 设置缓存
    await this.searchCacheService.setStatisticsCache('trend', cacheKey, result);
    
    return result;
  }

  /**
   * 获取热门搜索词统计
   */
  async getHotWordStatistics(limit: number = 10): Promise<HotWordStatisticsResponseDto[]> {
    const sql = `
      SELECT 
        hw.keyword,
        hw.search_count as searchCount,
        COUNT(DISTINCT sl.user_id) as userCount,
        (COUNT(DISTINCT sl.id) / hw.search_count) as conversionRate
      FROM mall_hot_words hw
      LEFT JOIN mall_search_log sl ON hw.keyword = sl.keyword 
        AND sl.delete_flag = 0 
        AND sl.create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE hw.delete_flag = 0
      GROUP BY hw.keyword, hw.search_count
      ORDER BY hw.search_count DESC
      LIMIT ?
    `;

    const rows = await this.dbConnectionService.query(sql, [limit]);
    
    return rows.map((row: any) => ({
      keyword: row.keyword,
      searchCount: row.searchCount,
      userCount: row.userCount,
      conversionRate: row.conversionRate || 0
    }));
  }

  /**
   * 获取搜索转化率统计
   */
  async getSearchConversionStatistics(): Promise<any> {
    // 总搜索次数
    const totalSearchesSql = `
      SELECT COUNT(*) as totalSearches 
      FROM mall_search_log 
      WHERE delete_flag = 0 
      AND create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    // 产生订单的搜索次数
    const conversionSearchesSql = `
      SELECT COUNT(DISTINCT sl.id) as conversionSearches
      FROM mall_search_log sl
      INNER JOIN mall_order o ON sl.user_id = o.user_id 
        AND o.create_time >= sl.create_time 
        AND o.create_time <= DATE_ADD(sl.create_time, INTERVAL 1 HOUR)
      WHERE sl.delete_flag = 0 
      AND sl.create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const [totalResult, conversionResult] = await Promise.all([
      this.dbConnectionService.queryOne(totalSearchesSql),
      this.dbConnectionService.queryOne(conversionSearchesSql)
    ]);

    const totalSearches = totalResult.totalSearches || 0;
    const conversionSearches = conversionResult.conversionSearches || 0;
    const conversionRate = totalSearches > 0 ? (conversionSearches / totalSearches) * 100 : 0;

    return {
      totalSearches,
      conversionSearches,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }

  /**
   * 记录搜索日志（用于统计和分析）
   */
  async recordSearchLog(userId: string, keyword: string, searchDepth: number = 1): Promise<void> {
    const sql = `
      INSERT INTO mall_search_log (user_id, keyword, search_depth, create_time, update_time, delete_flag)
      VALUES (?, ?, ?, NOW(), NOW(), 0)
    `;
    
    await this.dbConnectionService.query(sql, [userId, keyword, searchDepth]);
  }
}
