import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/database/db-connection.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly dbConnectionService: DbConnectionService,
  ) {}

  /**
   * 获取热门搜索关键词
   * @param count 获取数量
   * @returns 热门关键词列表
   */
  async getHotWords(count: number = 10): Promise<string[]> {
    const sql = `
      SELECT keyword 
      FROM mall_hot_words 
      WHERE enabled = ? 
      ORDER BY score DESC 
      LIMIT ?
    `;
    
    const rows = await this.dbConnectionService.query(sql, [true, count]);
    return rows.map((row: any) => row.keyword);
  }

  /**
   * 保存搜索历史
   * @param keyword 搜索关键词
   * @param userId 用户ID
   * @param userIp 用户IP
   * @param userAgent 用户浏览器
   */
  async saveSearchHistory(
    keyword: string,
    userId?: string,
    userIp?: string,
    userAgent?: string,
  ): Promise<void> {
    // 保存搜索历史
    const insertHistorySql = `
      INSERT INTO mall_search_history (keyword, user_id, user_ip, user_agent, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    await this.dbConnectionService.query(insertHistorySql, [keyword, userId, userIp, userAgent]);

    // 更新热门关键词
    const checkHotWordSql = `
      SELECT id, score 
      FROM mall_hot_words 
      WHERE keyword = ?
    `;
    const hotWord = await this.dbConnectionService.queryOne(checkHotWordSql, [keyword]);

    if (hotWord) {
      const updateHotWordSql = `
        UPDATE mall_hot_words 
        SET score = score + 1, updated_at = NOW() 
        WHERE id = ?
      `;
      await this.dbConnectionService.query(updateHotWordSql, [hotWord.id]);
    } else {
      const insertHotWordSql = `
        INSERT INTO mall_hot_words (keyword, score, enabled, created_at, updated_at)
        VALUES (?, 1, true, NOW(), NOW())
      `;
      await this.dbConnectionService.query(insertHotWordSql, [keyword]);
    }
  }

  /**
   * 获取用户搜索历史
   * @param userId 用户ID
   * @param limit 获取数量
   * @returns 搜索历史列表
   */
  async getSearchHistory(userId: string, limit: number = 10): Promise<string[]> {
    const sql = `
      SELECT keyword 
      FROM mall_search_history 
      WHERE user_id = ? 
      GROUP BY keyword 
      ORDER BY MAX(created_at) DESC 
      LIMIT ?
    `;
    
    const rows = await this.dbConnectionService.query(sql, [userId, limit]);
    return rows.map((row: any) => row.keyword);
  }

  /**
   * 清除用户搜索历史
   * @param userId 用户ID
   */
  async clearSearchHistory(userId: string): Promise<void> {
    const sql = `
      DELETE FROM mall_search_history 
      WHERE user_id = ?
    `;
    await this.dbConnectionService.query(sql, [userId]);
  }

  /**
   * 获取搜索联想
   * @param keyword 搜索关键词
   * @param limit 获取数量
   * @returns 搜索联想列表
   */
  async getSearchSuggestions(keyword: string, limit: number = 10): Promise<string[]> {
    if (!keyword) return [];

    // 从热门关键词中获取联想
    const hotWordsSql = `
      SELECT keyword 
      FROM mall_hot_words 
      WHERE enabled = ? AND keyword LIKE ? 
      ORDER BY score DESC 
      LIMIT ?
    `;
    const hotWordsSuggestions = await this.dbConnectionService.query(hotWordsSql, [true, `${keyword}%`, limit]);
    const hotWordsList = hotWordsSuggestions.map((row: any) => row.keyword);

    // 如果热门关键词不足，从商品名称中获取联想
    if (hotWordsList.length < limit) {
      const productsSql = `
        SELECT DISTINCT name 
        FROM mall_product 
        WHERE name LIKE ? AND is_show = ? 
        ORDER BY sales DESC 
        LIMIT ?
      `;
      const productSuggestions = await this.dbConnectionService.query(productsSql, [`%${keyword}%`, 1, limit - hotWordsList.length]);
      const productNamesList = productSuggestions.map((row: any) => row.name);

      // 合并去重
      const allSuggestions = [...new Set([...hotWordsList, ...productNamesList])];
      return allSuggestions.slice(0, limit);
    }

    return hotWordsList;
  }
}
