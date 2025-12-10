import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { DatabasePerformanceEntity } from '../entities/database-performance.entity';
import { DatabaseIndexEntity } from '../entities/database-index.entity';
import { DatabaseQueryEntity } from '../entities/database-query.entity';

@Injectable()
export class DatabaseOptimizationService {
  constructor(
    @InjectRepository(DatabasePerformanceEntity)
    private readonly performanceRepository: Repository<DatabasePerformanceEntity>,
    @InjectRepository(DatabaseIndexEntity)
    private readonly indexRepository: Repository<DatabaseIndexEntity>,
    @InjectRepository(DatabaseQueryEntity)
    private readonly queryRepository: Repository<DatabaseQueryEntity>,
  ) {}

  // 获取数据库性能指标
  async getPerformanceMetrics(startDate: Date, endDate: Date) {
    return await this.performanceRepository.find({
      where: {
        metricDate: Between(startDate, endDate)
      },
      order: { metricDate: 'DESC', metricType: 'ASC' }
    });
  }

  // 获取性能趋势数据
  async getPerformanceTrends(metricType: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return await this.performanceRepository.find({
      where: {
        metricType,
        metricDate: Between(startDate, endDate)
      },
      order: { metricDate: 'ASC' }
    });
  }

  // 获取索引使用情况
  async getIndexUsage() {
    return await this.indexRepository.find({
      order: { usageRate: 'DESC' }
    });
  }

  // 获取需要优化的索引
  async getIndexesForOptimization() {
    return await this.indexRepository.find({
      where: [
        { usageRate: MoreThan(90) }, // 使用率过高的索引
        { usageRate: MoreThan(100) }, // 冗余索引
        { status: 'UNUSED' }, // 未使用的索引
      ],
      order: { usageRate: 'DESC' }
    });
  }

  // 获取慢查询列表
  async getSlowQueries(limit: number = 50) {
    return await this.queryRepository.find({
      where: {
        avgExecutionTime: MoreThan(1000) // 超过1秒的查询
      },
      order: { avgExecutionTime: 'DESC' },
      take: limit
    });
  }

  // 获取高频查询
  async getFrequentQueries(limit: number = 30) {
    return await this.queryRepository.find({
      order: { executionCount: 'DESC' },
      take: limit
    });
  }

  // 获取查询性能统计
  async getQueryPerformanceStats(startDate?: Date, endDate?: Date) {
    const query = this.queryRepository.createQueryBuilder('query');
    
    if (startDate && endDate) {
      query.where('query.queryDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return await query
      .select('query.performanceLevel', 'performanceLevel')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(query.avgExecutionTime)', 'avgExecutionTime')
      .groupBy('query.performanceLevel')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  // 生成数据库优化建议
  async generateOptimizationSuggestions() {
    const suggestions = [];

    // 检查慢查询
    const slowQueries = await this.getSlowQueries(10);
    if (slowQueries.length > 0) {
      suggestions.push({
        type: 'SLOW_QUERIES',
        priority: 'HIGH',
        count: slowQueries.length,
        suggestions: slowQueries.map(q => q.optimizationSuggestion).filter(s => s)
      });
    }

    // 检查索引使用情况
    const unusedIndexes = await this.indexRepository.find({ 
      where: { status: 'UNUSED' } 
    });
    if (unusedIndexes.length > 0) {
      suggestions.push({
        type: 'UNUSED_INDEXES',
        priority: 'MEDIUM',
        count: unusedIndexes.length,
        suggestions: unusedIndexes.map(idx => ({
          table: idx.tableName,
          index: idx.indexName,
          action: '考虑删除未使用的索引以节省空间'
        }))
      });
    }

    // 检查高频查询的优化空间
    const frequentQueries = await this.getFrequentQueries(10);
    const unoptimizedFrequentQueries = frequentQueries.filter(
      q => q.performanceLevel !== 'EXCELLENT'
    );
    if (unoptimizedFrequentQueries.length > 0) {
      suggestions.push({
        type: 'FREQUENT_QUERIES',
        priority: 'HIGH',
        count: unoptimizedFrequentQueries.length,
        suggestions: unoptimizedFrequentQueries.map(q => q.optimizationSuggestion).filter(s => s)
      });
    }

    return suggestions;
  }

  // 执行索引优化
  async optimizeIndexes(indexIds: number[]) {
    const results = [];
    
    for (const indexId of indexIds) {
      const index = await this.indexRepository.findOne({ where: { id: indexId } });
      if (index) {
        // 这里只是记录优化建议，实际执行需要DBA权限
        results.push({
          indexId,
          tableName: index.tableName,
          indexName: index.indexName,
          suggestion: index.optimizationSuggestion,
          executed: false // 实际环境需要DBA执行
        });
      }
    }

    return results;
  }

  // 更新性能指标
  async updatePerformanceMetrics(metrics: Partial<DatabasePerformanceEntity>[]) {
    const results = await this.performanceRepository.save(metrics);
    return results;
  }

  // 清理过期数据
  async cleanupOldData(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.performanceRepository.delete({
      metricDate: MoreThan(cutoffDate)
    });

    await this.queryRepository.delete({
      queryDate: MoreThan(cutoffDate)
    });
  }

  // 获取数据库健康评分
  async getDatabaseHealthScore() {
    const performanceMetrics = await this.getPerformanceTrends('ALL', 7);
    const slowQueryCount = await this.getSlowQueries().then(queries => queries.length);
    const unusedIndexCount = await this.indexRepository.count({ 
      where: { status: 'UNUSED' } 
    });

    // 简单的健康评分算法
    let score = 100;
    
    // 慢查询扣分
    score -= Math.min(slowQueryCount * 2, 30);
    
    // 未使用索引扣分
    score -= Math.min(unusedIndexCount * 1, 20);
    
    // 性能趋势扣分
    if (performanceMetrics.length > 1) {
      const recent = performanceMetrics[performanceMetrics.length - 1];
      const previous = performanceMetrics[performanceMetrics.length - 2];
      if (recent.metricValue > previous.metricValue * 1.2) {
        score -= 10; // 性能下降
      }
    }

    return {
      score: Math.max(score, 0),
      level: score >= 90 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR',
      slowQueryCount,
      unusedIndexCount,
      lastUpdated: new Date()
    };
  }
}