import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface IndexAnalysis {
  tableName: string;
  currentIndexes: string[];
  recommendedIndexes: IndexRecommendation[];
  missingIndexes: IndexRecommendation[];
  slowQueries: SlowQuery[];
}

interface IndexRecommendation {
  name: string;
  columns: string[];
  type: 'INDEX' | 'UNIQUE' | 'FULLTEXT' | 'SPATIAL';
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedImprovement: string;
}

interface SlowQuery {
  query: string;
  executionTime: number;
  frequency: number;
  suggestedIndex?: IndexRecommendation;
}

@Injectable()
export class DatabaseIndexOptimizer {
  private readonly logger = new Logger(DatabaseIndexOptimizer.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 分析数据库索引情况
   */
  async analyzeIndexes(): Promise<IndexAnalysis[]> {
    const tables = await this.getAllTables();
    const analyses: IndexAnalysis[] = [];

    for (const table of tables) {
      const analysis = await this.analyzeTableIndexes(table);
      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * 生成索引优化SQL
   */
  async generateOptimizationSQL(analysis: IndexAnalysis): Promise<string[]> {
    const sqlStatements: string[] = [];

    // 生成缺失索引的创建语句
    for (const missingIndex of analysis.missingIndexes) {
      const sql = this.generateCreateIndexSQL(analysis.tableName, missingIndex);
      sqlStatements.push(sql);
    }

    // 生成推荐的复合索引
    for (const recommendedIndex of analysis.recommendedIndexes) {
      const sql = this.generateCreateIndexSQL(analysis.tableName, recommendedIndex);
      sqlStatements.push(sql);
    }

    return sqlStatements;
  }

  /**
   * 执行索引优化
   */
  async executeOptimization(sqlStatements: string[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const sql of sqlStatements) {
        this.logger.log(`执行索引优化: ${sql}`);
        await queryRunner.query(sql);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`成功执行 ${sqlStatements.length} 个索引优化`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('索引优化失败', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 分析单个表的索引
   */
  private async analyzeTableIndexes(tableName: string): Promise<IndexAnalysis> {
    const currentIndexes = await this.getCurrentIndexes(tableName);
    const slowQueries = await this.getSlowQueries(tableName);
    const recommendedIndexes = this.getRecommendedIndexes(tableName, currentIndexes);
    const missingIndexes = this.getMissingIndexes(tableName, currentIndexes);

    return {
      tableName,
      currentIndexes,
      recommendedIndexes,
      missingIndexes,
      slowQueries,
    };
  }

  /**
   * 获取所有表名
   */
  private async getAllTables(): Promise<string[]> {
    const result = await this.dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_type = 'BASE TABLE'
    `);

    return result.map((row: any) => row.table_name);
  }

  /**
   * 获取当前索引
   */
  private async getCurrentIndexes(tableName: string): Promise<string[]> {
    const result = await this.dataSource.query(`
      SELECT DISTINCT index_name 
      FROM information_schema.statistics 
      WHERE table_schema = DATABASE() 
      AND table_name = ?
      AND index_name != 'PRIMARY'
    `, [tableName]);

    return result.map((row: any) => row.index_name);
  }

  /**
   * 获取慢查询
   */
  private async getSlowQueries(tableName: string): Promise<SlowQuery[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT sql_text, exec_time, timer_wait/1000000000 as execution_time
        FROM performance_schema.events_statements_history_long 
        WHERE DIGEST_TEXT LIKE ?
        ORDER BY timer_wait DESC 
        LIMIT 10
      `, [`%${tableName}%`]);

      return result.map((row: any) => ({
        query: row.sql_text,
        executionTime: row.execution_time,
        frequency: 1, // 简化处理
        suggestedIndex: this.suggestIndexFromQuery(row.sql_text),
      }));
    } catch (error) {
      this.logger.warn(`无法获取表 ${tableName} 的慢查询信息`, error);
      return [];
    }
  }

  /**
   * 从SQL查询推断推荐索引
   */
  private suggestIndexFromQuery(sql: string): IndexRecommendation | undefined {
    // 简单的SQL解析逻辑，实际项目中可能需要更复杂的解析
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/i);
    if (!whereMatch) return undefined;

    const whereClause = whereMatch[1];
    const columnMatches = whereClause.match(/(\w+)\s*(?:=|>|<|LIKE|IN)/gi);
    
    if (columnMatches && columnMatches.length > 0) {
      const columns = [...new Set(columnMatches.map(match => match.toLowerCase()))];
      
      return {
        name: `idx_auto_${Date.now()}`,
        columns,
        type: 'INDEX',
        reason: '基于慢查询分析自动推荐',
        priority: 'HIGH',
        estimatedImprovement: '50-80%',
      };
    }

    return undefined;
  }

  /**
   * 获取推荐索引
   */
  private getRecommendedIndexes(tableName: string, currentIndexes: string[]): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];

    // 基于表名推断推荐索引
    if (tableName.includes('distribution')) {
      recommendations.push({
        name: 'idx_distribution_member_status',
        columns: ['member_id', 'distribution_status', 'delete_flag'],
        type: 'INDEX',
        reason: '分销员查询优化',
        priority: 'HIGH',
        estimatedImprovement: '70-90%',
      });

      recommendations.push({
        name: 'idx_distribution_status_time',
        columns: ['distribution_status', 'create_time'],
        type: 'INDEX',
        reason: '分销员审核查询优化',
        priority: 'MEDIUM',
        estimatedImprovement: '60-80%',
      });
    }

    if (tableName.includes('product')) {
      recommendations.push({
        name: 'idx_product_category_show',
        columns: ['category_id', 'is_show', 'sort_order'],
        type: 'INDEX',
        reason: '商品列表查询优化',
        priority: 'HIGH',
        estimatedImprovement: '80-95%',
      });

      recommendations.push({
        name: 'idx_product_search',
        columns: ['name', 'is_show', 'price'],
        type: 'FULLTEXT',
        reason: '商品搜索优化',
        priority: 'MEDIUM',
        estimatedImprovement: '50-70%',
      });
    }

    if (tableName.includes('order')) {
      recommendations.push({
        name: 'idx_order_user_status',
        columns: ['user_id', 'order_status', 'create_time'],
        type: 'INDEX',
        reason: '订单查询优化',
        priority: 'HIGH',
        estimatedImprovement: '80-90%',
      });
    }

    return recommendations.filter(rec => !currentIndexes.includes(rec.name));
  }

  /**
   * 获取缺失的基础索引
   */
  private getMissingIndexes(tableName: string, currentIndexes: string[]): IndexRecommendation[] {
    const missingIndexes: IndexRecommendation[] = [];

    // 检查常见字段的索引
    const commonFields = ['id', 'member_id', 'user_id', 'status', 'create_time', 'delete_flag'];
    
    for (const field of commonFields) {
      const indexName = `idx_${field}`;
      if (!currentIndexes.includes(indexName)) {
        missingIndexes.push({
          name: indexName,
          columns: [field],
          type: 'INDEX',
          reason: `缺失 ${field} 字段的索引`,
          priority: 'MEDIUM',
          estimatedImprovement: '30-50%',
        });
      }
    }

    return missingIndexes;
  }

  /**
   * 生成创建索引的SQL
   */
  private generateCreateIndexSQL(tableName: string, index: IndexRecommendation): string {
    const columns = index.columns.join(', ');
    
    if (index.type === 'UNIQUE') {
      return `CREATE UNIQUE INDEX ${index.name} ON ${tableName} (${columns});`;
    } else if (index.type === 'FULLTEXT') {
      return `CREATE FULLTEXT INDEX ${index.name} ON ${tableName} (${columns});`;
    } else {
      return `CREATE INDEX ${index.name} ON ${tableName} (${columns});`;
    }
  }

  /**
   * 验证索引效果
   */
  async validateIndexes(tableName: string, indexNames: string[]): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      // 执行测试查询并比较执行计划
      const testQueries = this.getTestQueries(tableName);
      const results = [];

      for (const query of testQueries) {
        const explain = await queryRunner.query(`EXPLAIN ${query.sql}`);
        results.push({
          query: query.description,
          explain,
          usingIndex: explain.some((row: any) => row.key && indexNames.includes(row.key)),
        });
      }

      return results;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取测试查询
   */
  private getTestQueries(tableName: string): Array<{ description: string; sql: string }> {
    const queries = [];

    if (tableName.includes('distribution')) {
      queries.push({
        description: '按会员ID查询分销员',
        sql: `SELECT * FROM ${tableName} WHERE member_id = 'test' AND delete_flag = false`,
      });
      queries.push({
        description: '按状态查询分销员',
        sql: `SELECT * FROM ${tableName} WHERE distribution_status = 'APPLY' ORDER BY create_time DESC`,
      });
    }

    if (tableName.includes('product')) {
      queries.push({
        description: '商品列表查询',
        sql: `SELECT * FROM ${tableName} WHERE category_id = 'test' AND is_show = 1 ORDER BY sort_order ASC`,
      });
    }

    return queries;
  }
}