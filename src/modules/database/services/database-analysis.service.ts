import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabasePerformanceEntity } from '../entities/database-performance.entity';
import { DatabaseIndexEntity } from '../entities/database-index.entity';
import { DatabaseQueryEntity } from '../entities/database-query.entity';

@Injectable()
export class DatabaseAnalysisService {
  constructor(
    @InjectRepository(DatabasePerformanceEntity)
    private readonly performanceRepository: Repository<DatabasePerformanceEntity>,
    @InjectRepository(DatabaseIndexEntity)
    private readonly indexRepository: Repository<DatabaseIndexEntity>,
    @InjectRepository(DatabaseQueryEntity)
    private readonly queryRepository: Repository<DatabaseQueryEntity>,
  ) {}

  // 分析数据库连接数
  async analyzeConnections() {
    // 模拟数据库连接分析
    return {
      maxConnections: 1000,
      currentConnections: 250,
      activeConnections: 180,
      idleConnections: 70,
      connectionUsage: 25, // 使用率百分比
      status: 'HEALTHY',
      recommendations: [
        '当前连接数在正常范围内',
        '建议监控高峰期连接数变化'
      ]
    };
  }

  // 分析锁等待情况
  async analyzeLockWaits() {
    // 模拟锁等待分析
    return {
      totalLocks: 15,
      waitingLocks: 2,
      longestWaitTime: 500, // 毫秒
      avgWaitTime: 120,
      status: 'NORMAL',
      recommendations: [
        '锁等待情况正常',
        '建议关注长时间运行的事务'
      ]
    };
  }

  // 分析表空间使用情况
  async analyzeTablespaces() {
    // 模拟表空间分析
    return [
      {
        name: 'MALL_ECO_DATA',
        totalSize: 50000, // MB
        usedSize: 35000,
        freeSize: 15000,
        usage: 70,
        status: 'NORMAL'
      },
      {
        name: 'MALL_ECO_INDEX',
        totalSize: 20000,
        usedSize: 18000,
        freeSize: 2000,
        usage: 90,
        status: 'WARNING'
      }
    ];
  }

  // 分析缓存命中率
  async analyzeCacheHitRates() {
    // 模拟缓存分析
    return {
      bufferPoolHitRate: 98.5,
      queryCacheHitRate: 85.2,
      innodbBufferPoolReads: 1000000,
      innodbBufferPoolReadRequests: 50000000,
      status: 'EXCELLENT',
      recommendations: [
        '缓存命中率表现良好',
        '建议保持当前的缓存配置'
      ]
    };
  }

  // 分析临时表使用情况
  async analyzeTemporaryTables() {
    // 模拟临时表分析
    return {
      temporaryTablesCreated: 1500,
      temporaryTablesOnDisk: 200,
      temporaryTableSize: 500, // MB
      diskTableRatio: 13.3, // 磁盘临时表比例
      status: 'GOOD',
      recommendations: [
        '临时表使用情况正常',
        '建议优化需要磁盘临时表的查询'
      ]
    };
  }

  // 分析排序操作
  async analyzeSortingOperations() {
    // 模拟排序分析
    return {
      sortMergePasses: 50,
      sortRange: 8000,
      sortRows: 500000,
      sortScan: 12000,
      avgSortTime: 150, // 毫秒
      status: 'GOOD',
      recommendations: [
        '排序操作性能正常',
        '注意大结果集的排序优化'
      ]
    };
  }

  // 生成完整分析报告
  async generateFullAnalysis() {
    const [
      connections,
      lockWaits,
      tablespaces,
      cacheHitRates,
      temporaryTables,
      sortingOps
    ] = await Promise.all([
      this.analyzeConnections(),
      this.analyzeLockWaits(),
      this.analyzeTablespaces(),
      this.analyzeCacheHitRates(),
      this.analyzeTemporaryTables(),
      this.analyzeSortingOperations()
    ]);

    const healthScore = this.calculateHealthScore({
      connections,
      lockWaits,
      tablespaces,
      cacheHitRates,
      temporaryTables,
      sortingOps
    });

    return {
      timestamp: new Date(),
      healthScore,
      sections: {
        connections,
        lockWaits,
        tablespaces,
        cacheHitRates,
        temporaryTables,
        sorting: sortingOps
      },
      recommendations: this.generateRecommendations({
        connections,
        lockWaits,
        tablespaces,
        cacheHitRates,
        temporaryTables,
        sortingOps
      })
    };
  }

  // 计算健康评分
  private calculateHealthScore(data: any): number {
    let score = 100;

    // 连接使用率评分
    if (data.connections.connectionUsage > 80) score -= 20;
    else if (data.connections.connectionUsage > 60) score -= 10;

    // 锁等待评分
    if (data.lockWaits.longestWaitTime > 5000) score -= 20;
    else if (data.lockWaits.longestWaitTime > 1000) score -= 10;

    // 表空间使用率评分
    data.tablespaces.forEach((tablespace: any) => {
      if (tablespace.usage > 90) score -= 15;
      else if (tablespace.usage > 80) score -= 8;
    });

    // 缓存命中率评分
    if (data.cacheHitRates.bufferPoolHitRate < 95) score -= 15;
    else if (data.cacheHitRates.bufferPoolHitRate < 98) score -= 5;

    // 临时表评分
    if (data.temporaryTables.diskTableRatio > 30) score -= 15;
    else if (data.temporaryTables.diskTableRatio > 20) score -= 8;

    return Math.max(score, 0);
  }

  // 生成优化建议
  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    if (data.connections.connectionUsage > 80) {
      recommendations.push('连接使用率过高，建议优化连接池配置或增加连接数');
    }

    if (data.lockWaits.longestWaitTime > 1000) {
      recommendations.push('检测到长锁等待，建议检查长时间运行的事务');
    }

    data.tablespaces.forEach((tablespace: any) => {
      if (tablespace.usage > 90) {
        recommendations.push(`表空间 ${tablespace.name} 使用率过高，建议扩展存储空间`);
      }
    });

    if (data.cacheHitRates.bufferPoolHitRate < 95) {
      recommendations.push('缓冲池命中率偏低，建议增加缓冲池大小');
    }

    if (data.temporaryTables.diskTableRatio > 20) {
      recommendations.push('磁盘临时表比例较高，建议优化相关查询或增加内存');
    }

    if (recommendations.length === 0) {
      recommendations.push('数据库整体运行状况良好，建议保持当前配置');
    }

    return recommendations;
  }

  // 获取历史分析数据
  async getHistoricalAnalysis(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return await this.performanceRepository.find({
      where: {
        metricType: 'HEALTH_SCORE',
        metricDate: Between(startDate, endDate)
      },
      order: { metricDate: 'ASC' }
    });
  }

  // 比较分析结果
  async compareAnalysis(date1: Date, date2: Date) {
    const [analysis1, analysis2] = await Promise.all([
      this.getAnalysisForDate(date1),
      this.getAnalysisForDate(date2)
    ]);

    if (!analysis1 || !analysis2) {
      throw new Error('无法获取指定日期的分析数据');
    }

    const comparison = {
      date1: date1,
      date2: date2,
      healthScoreChange: analysis2.healthScore - analysis1.healthScore,
      changes: {}
    };

    // 比较各项指标
    const metrics = ['connectionUsage', 'bufferPoolHitRate', 'diskTableRatio'];
    metrics.forEach(metric => {
      // @ts-ignore
      comparison.changes[metric] = {
        // @ts-ignore
        before: analysis1.sections[metric] || 0,
        // @ts-ignore
        after: analysis2.sections[metric] || 0,
        // @ts-ignore
        change: ((analysis2.sections[metric] || 0) - (analysis1.sections[metric] || 0))
      };
    });

    return comparison;
  }

  // 获取指定日期的分析数据
  private async getAnalysisForDate(date: Date) {
    // 这里简化处理，实际应该从历史记录中获取
    return await this.generateFullAnalysis();
  }
}