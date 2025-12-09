import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/database/db-connection.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticsearchProductService } from '../../products/elasticsearch.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly dbConnectionService: DbConnectionService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly elasticsearchProductService: ElasticsearchProductService
  ) {}

  /**
   * 获取热门搜索关键词
   */
  async getHotWords(limit: number = 10): Promise<string[]> {
    const sql = `
      SELECT keyword 
      FROM mall_hot_words 
      WHERE delete_flag = 0 
      ORDER BY sort DESC, id DESC 
      LIMIT ?
    `;
    
    const rows = await this.dbConnectionService.query(sql, [limit]);
    return rows.map((row: any) => row.keyword);
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
      } as any;

      // 处理Elasticsearch建议结果
      if (response.suggest && response.suggest.product_suggestions) {
        const suggestions = response.suggest.product_suggestions[0].options.map((option: any) => option.text);
        if (suggestions.length > 0) {
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
    return rows.map((row: any) => row.name);
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
      // 这里可以添加搜索历史记录逻辑，例如记录热门搜索词的搜索次数
      await this.updateHotWordSearchCount(keyword);
    }

    return {
      products: searchResult.data,
      total: searchResult.total,
      page,
      pageSize,
      totalPages: Math.ceil(searchResult.total / pageSize)
    };
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
}
