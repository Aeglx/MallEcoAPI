import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { CachePerformanceEntity } from '../entities/cache-performance.entity';
import { CacheConfigEntity } from '../entities/cache-config.entity';
import { CacheInvalidationEntity } from '../entities/cache-invalidation.entity';

@Injectable()
export class CacheAnalysisService {
  constructor(
    @InjectRepository(CachePerformanceEntity)
    private readonly performanceRepository: Repository<CachePerformanceEntity>,
    @InjectRepository(CacheConfigEntity)
    private readonly configRepository: Repository<CacheConfigEntity>,
    @InjectRepository(CacheInvalidationEntity)
    private readonly invalidationRepository: Repository<CacheInvalidationEntity>,
  ) {}

  // 分析缓存命中率趋�?
  async analyzeHitRateTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const trends = await this.performanceRepository.find({
      where: {
        metricDate: Between(startDate, endDate),
        metricName: 'hit_rate',
      },
      order: { metricDate: 'ASC' },
    });

    const groupedTrends = {};
    trends.forEach(trend => {
      if (!groupedTrends[trend.cacheType]) {
        groupedTrends[trend.cacheType] = [];
      }
      groupedTrends[trend.cacheType].push({
        date: trend.metricDate,
        hitRate: trend.hitRate,
        memoryUsage: trend.memoryUsage,
      });
    });

    return groupedTrends;
  }

  // 分析内存使用情况
  async analyzeMemoryUsage() {
    const latestMetrics = await this.performanceRepository
      .createQueryBuilder('performance')
      .select('performance.cacheType', 'cacheType')
      .addSelect('MAX(performance.metricDate)', 'latestDate')
      .addSelect('performance.memoryUsage', 'memoryUsage')
      .addSelect('performance.memoryLimit', 'memoryLimit')
      .addSelect('performance.hitRate', 'hitRate')
      .groupBy('performance.cacheType')
      .getRawMany();

    return latestMetrics.map(metric => ({
      cacheType: metric.cacheType,
      memoryUsage: metric.memoryUsage,
      memoryLimit: metric.memoryLimit,
      usagePercentage: (metric.memoryUsage / metric.memoryLimit) * 100,
      hitRate: metric.hitRate,
      status: this.getMemoryStatus(metric.memoryUsage, metric.memoryLimit),
      recommendation: this.getMemoryRecommendation(
        metric.memoryUsage,
        metric.memoryLimit,
        metric.hitRate,
      ),
    }));
  }

  // 获取内存状�?
  private getMemoryStatus(usage: number, limit: number): string {
    const percentage = (usage / limit) * 100;
    if (percentage > 90) return 'CRITICAL';
    if (percentage > 80) return 'WARNING';
    if (percentage > 70) return 'CAUTION';
    return 'HEALTHY';
  }

  // 获取内存建议
  private getMemoryRecommendation(usage: number, limit: number, hitRate: number): string {
    const percentage = (usage / limit) * 100;

    if (percentage > 90) {
      return '内存使用率过高，建议立即清理或扩容';
    }
    if (percentage > 80) {
      return '内存使用率较高，建议监控并准备清理策略';
    }
    if (hitRate < 70) {
      return '命中率偏低，建议优化缓存策略';
    }
    return '内存使用正常';
  }

  // 分析热点数据
  async analyzeHotData(limit: number = 20) {
    const hotData = await this.configRepository.find({
      where: { isActive: true },
      order: { accessFrequency: 'DESC' },
      take: limit,
    });

    return hotData.map(data => ({
      cacheKey: data.cacheKey,
      cacheType: data.cacheType,
      accessFrequency: data.accessFrequency,
      hitRate: data.hitRate,
      dataSize: data.dataSize,
      isWarmedUp: data.isWarmedUp,
      priority: this.calculateHotDataPriority(data),
    }));
  }

  // 计算热点数据优先�?
  private calculateHotDataPriority(data: CacheConfigEntity): string {
    const frequency = data.accessFrequency;
    const hitRate = data.hitRate;

    if (frequency > 1000 && hitRate > 90) return 'CRITICAL';
    if (frequency > 500 && hitRate > 80) return 'HIGH';
    if (frequency > 100 && hitRate > 70) return 'MEDIUM';
    return 'LOW';
  }

  // 分析缓存失效影响
  async analyzeInvalidationImpact(days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const invalidations = await this.invalidationRepository.find({
      where: {
        invalidationDate: Between(startDate, endDate),
      },
      order: { executionTime: 'DESC' },
    });

    const impactAnalysis = {
      totalInvalidations: invalidations.length,
      highImpactInvalidations: 0,
      mediumImpactInvalidations: 0,
      lowImpactInvalidations: 0,
      avgExecutionTime: 0,
      totalAffectedKeys: 0,
      byType: {},
      bySource: {},
      recommendations: [],
    };

    invalidations.forEach(invalidation => {
      // 计算影响级别
      const impact = this.calculateInvalidationImpact(invalidation);
      if (impact === 'HIGH') impactAnalysis.highImpactInvalidations++;
      else if (impact === 'MEDIUM') impactAnalysis.mediumImpactInvalidations++;
      else impactAnalysis.lowImpactInvalidations++;

      // 统计执行时间
      impactAnalysis.avgExecutionTime += invalidation.executionTime;
      impactAnalysis.totalAffectedKeys += invalidation.keysCount;

      // 按类型统�?
      if (!impactAnalysis.byType[invalidation.invalidationType]) {
        impactAnalysis.byType[invalidation.invalidationType] = 0;
      }
      impactAnalysis.byType[invalidation.invalidationType]++;

      // 按触发源统计
      if (!impactAnalysis.bySource[invalidation.triggerSource]) {
        impactAnalysis.bySource[invalidation.triggerSource] = 0;
      }
      impactAnalysis.bySource[invalidation.triggerSource]++;
    });

    if (invalidations.length > 0) {
      impactAnalysis.avgExecutionTime = impactAnalysis.avgExecutionTime / invalidations.length;
    }

    // 生成建议
    impactAnalysis.recommendations = this.generateInvalidationRecommendations(impactAnalysis);

    return impactAnalysis;
  }

  // 计算失效影响
  private calculateInvalidationImpact(invalidation: CacheInvalidationEntity): string {
    const { keysCount, executionTime, isBatch } = invalidation;

    if (keysCount > 100 || executionTime > 1000 || isBatch) {
      return 'HIGH';
    }
    if (keysCount > 50 || executionTime > 500) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  // 生成失效建议
  private generateInvalidationRecommendations(analysis: any): string[] {
    const recommendations = [];

    if (analysis.highImpactInvalidations > 0) {
      recommendations.push('存在高影响失效事件，建议优化失效策略');
    }

    if (analysis.avgExecutionTime > 500) {
      recommendations.push('失效执行时间较长，考虑异步处理');
    }

    if (analysis.totalInvalidations > 100) {
      recommendations.push('失效频率较高，检查业务逻辑是否合理');
    }

    return recommendations;
  }

  // 分析缓存效率
  async analyzeCacheEfficiency() {
    const configs = await this.configRepository.find({ where: { isActive: true } });

    const efficiency = {
      totalConfigs: configs.length,
      highEfficiencyConfigs: 0,
      mediumEfficiencyConfigs: 0,
      lowEfficiencyConfigs: 0,
      avgHitRate: 0,
      avgAccessFrequency: 0,
      warmedUpConfigs: 0,
      efficiencyDistribution: {},
      recommendations: [],
    };

    let totalHitRate = 0;
    let totalAccessFrequency = 0;

    configs.forEach(config => {
      totalHitRate += config.hitRate;
      totalAccessFrequency += config.accessFrequency;

      const efficiencyLevel = this.getEfficiencyLevel(config.hitRate, config.accessFrequency);
      if (efficiencyLevel === 'HIGH') efficiency.highEfficiencyConfigs++;
      else if (efficiencyLevel === 'MEDIUM') efficiency.mediumEfficiencyConfigs++;
      else efficiency.lowEfficiencyConfigs++;

      if (config.isWarmedUp) efficiency.warmedUpConfigs++;

      // 分布统计
      if (!efficiency.efficiencyDistribution[efficiencyLevel]) {
        efficiency.efficiencyDistribution[efficiencyLevel] = 0;
      }
      efficiency.efficiencyDistribution[efficiencyLevel]++;
    });

    if (configs.length > 0) {
      efficiency.avgHitRate = totalHitRate / configs.length;
      efficiency.avgAccessFrequency = totalAccessFrequency / configs.length;
    }

    // 生成建议
    efficiency.recommendations = this.getEfficiencyRecommendations(efficiency);

    return efficiency;
  }

  // 获取效率级别
  private getEfficiencyLevel(hitRate: number, accessFrequency: number): string {
    if (hitRate > 90 && accessFrequency > 500) return 'HIGH';
    if (hitRate > 70 && accessFrequency > 100) return 'MEDIUM';
    return 'LOW';
  }

  // 获取效率建议
  private getEfficiencyRecommendations(efficiency: any): string[] {
    const recommendations = [];

    if (efficiency.avgHitRate < 80) {
      recommendations.push('平均命中率偏低，建议优化缓存策略和TTL设置');
    }

    if (efficiency.warmedUpConfigs < efficiency.totalConfigs * 0.8) {
      recommendations.push('预热配置不足，建议实现缓存预热机制');
    }

    if (efficiency.lowEfficiencyConfigs > efficiency.totalConfigs * 0.3) {
      recommendations.push('低效配置较多，需要全面优化缓存设置');
    }

    return recommendations;
  }

  // 生成缓存分析报告
  async generateAnalysisReport(startDate?: Date, endDate?: Date) {
    const [hitRateTrends, memoryUsage, hotData, invalidationImpact, cacheEfficiency] =
      await Promise.all([
        this.analyzeHitRateTrends(),
        this.analyzeMemoryUsage(),
        this.analyzeHotData(),
        this.analyzeInvalidationImpact(),
        this.analyzeCacheEfficiency(),
      ]);

    const report = {
      generatedAt: new Date(),
      period: { startDate, endDate },
      sections: {
        hitRateTrends,
        memoryUsage,
        hotData,
        invalidationImpact,
        cacheEfficiency,
      },
      summary: this.generateSummary({
        hitRateTrends,
        memoryUsage,
        invalidationImpact,
        cacheEfficiency,
      }),
      recommendations: this.getOverallRecommendations({
        hitRateTrends,
        memoryUsage,
        hotData,
        invalidationImpact,
        cacheEfficiency,
      }),
    };

    return report;
  }

  // 生成摘要
  private generateSummary(sections: any): any {
    const hitRateTrends = sections.hitRateTrends || {};
    const trendKeys = Object.keys(hitRateTrends);
    let totalHitRate = 0;
    let validTrends = 0;

    Object.values(hitRateTrends).forEach((trend: any) => {
      if (Array.isArray(trend) && trend.length > 0) {
        const latest = trend[trend.length - 1];
        if (typeof latest?.hitRate === 'number') {
          totalHitRate += latest.hitRate;
          validTrends++;
        }
      }
    });

    const avgHitRate = validTrends > 0 ? totalHitRate / validTrends : 0;

    const criticalMemoryIssues = sections.memoryUsage.filter(
      (m: any) => m.status === 'CRITICAL',
    ).length;
    const highImpactInvalidations = sections.invalidationImpact.highImpactInvalidations;
    const lowEfficiencyRate =
      (sections.cacheEfficiency.lowEfficiencyConfigs / sections.cacheEfficiency.totalConfigs) * 100;

    return {
      overallHealth: this.calculateOverallHealth(
        avgHitRate,
        criticalMemoryIssues,
        highImpactInvalidations,
        lowEfficiencyRate,
      ),
      avgHitRate,
      criticalIssues: criticalMemoryIssues + highImpactInvalidations,
      lowEfficiencyRate,
      status: criticalMemoryIssues > 0 || highImpactInvalidations > 0 ? 'ATTENTION' : 'HEALTHY',
    };
  }

  // 计算整体健康�?
  private calculateOverallHealth(
    hitRate: number,
    criticalMemory: number,
    highImpactInvalidations: number,
    lowEfficiencyRate: number,
  ): number {
    let score = 100;

    // 命中率影�?
    score -= Math.max(0, (90 - hitRate) * 0.5);

    // 严重问题扣分
    score -= criticalMemory * 10;
    score -= highImpactInvalidations * 5;

    // 低效率扣�?
    score -= lowEfficiencyRate * 0.3;

    return Math.max(0, Math.round(score));
  }

  // 获取整体建议
  private getOverallRecommendations(sections: any): string[] {
    const recommendations = [];

    // 添加各部分的建议
    recommendations.push(
      ...sections.memoryUsage
        .filter((m: any) => m.status !== 'HEALTHY')
        .map((m: any) => m.recommendation),
    );

    recommendations.push(...sections.invalidationImpact.recommendations);
    recommendations.push(...sections.cacheEfficiency.recommendations);

    // 去重
    return [...new Set(recommendations)];
  }
}
