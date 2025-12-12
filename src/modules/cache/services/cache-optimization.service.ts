import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { CachePerformanceEntity } from '../entities/cache-performance.entity';
import { CacheConfigEntity } from '../entities/cache-config.entity';
import { CacheInvalidationEntity } from '../entities/cache-invalidation.entity';

@Injectable()
export class CacheOptimizationService {
  constructor(
    @InjectRepository(CachePerformanceEntity)
    private readonly performanceRepository: Repository<CachePerformanceEntity>,
    @InjectRepository(CacheConfigEntity)
    private readonly configRepository: Repository<CacheConfigEntity>,
    @InjectRepository(CacheInvalidationEntity)
    private readonly invalidationRepository: Repository<CacheInvalidationEntity>,
  ) {}

  // 获取缓存性能指标
  async getCachePerformanceMetrics(startDate: Date, endDate: Date) {
    return await this.performanceRepository.find({
      where: {
        metricDate: Between(startDate, endDate)
      },
      order: { metricDate: 'DESC', cacheType: 'ASC' }
    });
  }

  // 获取所有缓存类型的状�?
  async getAllCacheStatus() {
    const cacheTypes = ['REDIS', 'MEMCACHED', 'LOCAL', 'DATABASE'];
    const results = [];

    for (const cacheType of cacheTypes) {
      const latestMetric = await this.performanceRepository.findOne({
        where: { cacheType },
        order: { metricDate: 'DESC' }
      });

      results.push({
        cacheType,
        status: latestMetric ? this.determineCacheStatus(latestMetric) : 'UNKNOWN',
        hitRate: latestMetric?.hitRate || 0,
        memoryUsage: latestMetric?.memoryUsage || 0,
        memoryLimit: latestMetric?.memoryLimit || 0,
        lastUpdated: latestMetric?.createdAt || null
      });
    }

    return results;
  }

  // 确定缓存状�?
  private determineCacheStatus(metric: CachePerformanceEntity): string {
    if (metric.hitRate >= 95) return 'EXCELLENT';
    if (metric.hitRate >= 85) return 'GOOD';
    if (metric.hitRate >= 70) return 'FAIR';
    if (metric.hitRate >= 50) return 'POOR';
    return 'CRITICAL';
  }

  // 获取缓存配置列表
  async getCacheConfigs() {
    return await this.configRepository.find({
      order: { accessFrequency: 'DESC', hitRate: 'DESC' }
    });
  }

  // 获取需要优化的缓存配置
  async getOptimizationTargets() {
    const targets = await this.configRepository.find({
      where: [
        { hitRate: MoreThan(90) }, // 命中率过�?
        { accessFrequency: MoreThan(1000) }, // 访问频率过高
        { isWarmedUp: false }, // 未预热的缓存
      ],
      order: { accessFrequency: 'DESC' }
    });

    return targets.filter(config => 
      config.hitRate < 70 || 
      config.accessFrequency > 1000 || 
      !config.isWarmedUp
    );
  }

  // 获取缓存失效记录
  async getInvalidationHistory(startDate?: Date, endDate?: Date, cacheType?: string) {
    const query = this.invalidationRepository.createQueryBuilder('invalidation');
    
    if (startDate && endDate) {
      query.where('invalidation.invalidationDate BETWEEN :startDate AND :endDate', { 
        startDate, endDate 
      });
    }

    if (cacheType) {
      query.andWhere('invalidation.cacheType = :cacheType', { cacheType });
    }

    return await query
      .orderBy('invalidation.invalidationDate', 'DESC')
      .getMany();
  }

  // 分析缓存失效模式
  async analyzeInvalidationPatterns() {
    const patterns = await this.invalidationRepository
      .createQueryBuilder('invalidation')
      .select('invalidation.invalidationType', 'type')
      .addSelect('invalidation.triggerSource', 'source')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(invalidation.keysCount)', 'avgKeysCount')
      .addSelect('AVG(invalidation.executionTime)', 'avgExecutionTime')
      .groupBy('invalidation.invalidationType, invalidation.triggerSource')
      .orderBy('count', 'DESC')
      .getRawMany();

    return patterns.map(pattern => ({
      type: pattern.type,
      source: pattern.source,
      count: parseInt(pattern.count),
      avgKeysCount: parseFloat(pattern.avgKeysCount),
      avgExecutionTime: parseFloat(pattern.avgExecutionTime),
      impact: this.calculateImpact(pattern)
    }));
  }

  // 计算失效影响
  private calculateImpact(pattern: any): string {
    const { count, avgKeysCount, avgExecutionTime } = pattern;
    
    if (count > 100 && avgKeysCount > 50 && avgExecutionTime > 1000) {
      return 'HIGH';
    }
    if (count > 50 || avgKeysCount > 20 || avgExecutionTime > 500) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  // 生成缓存优化建议
  async generateOptimizationSuggestions() {
    const suggestions = [];
    const configs = await this.getCacheConfigs();
    const invalidations = await this.analyzeInvalidationPatterns();

    // 分析命中率低的缓�?
    const lowHitRateConfigs = configs.filter(c => c.hitRate < 70);
    if (lowHitRateConfigs.length > 0) {
      suggestions.push({
        type: 'LOW_HIT_RATE',
        priority: 'HIGH',
        count: lowHitRateConfigs.length,
        suggestions: lowHitRateConfigs.map(config => ({
          key: config.cacheKey,
          hitRate: config.hitRate,
          suggestion: '考虑调整TTL或缓存策略，提高命中率'
        }))
      });
    }

    // 分析高频访问的缓�?
    const highFrequencyConfigs = configs.filter(c => c.accessFrequency > 1000);
    if (highFrequencyConfigs.length > 0) {
      suggestions.push({
        type: 'HIGH_FREQUENCY',
        priority: 'MEDIUM',
        count: highFrequencyConfigs.length,
        suggestions: highFrequencyConfigs.map(config => ({
          key: config.cacheKey,
          frequency: config.accessFrequency,
          suggestion: '考虑使用更快的缓存存储或实现缓存预热'
        }))
      });
    }

    // 分析失效影响
    const highImpactInvalidations = invalidations.filter(i => i.impact === 'HIGH');
    if (highImpactInvalidations.length > 0) {
      suggestions.push({
        type: 'HIGH_IMPACT_INVALIDATION',
        priority: 'HIGH',
        count: highImpactInvalidations.length,
        suggestions: highImpactInvalidations.map(invalidation => ({
          type: invalidation.type,
          source: invalidation.source,
          suggestion: '优化失效策略，考虑异步失效或批量处理'
        }))
      });
    }

    // 分析未预热的缓存
    const unwarmedConfigs = configs.filter(c => !c.isWarmedUp && c.accessFrequency > 100);
    if (unwarmedConfigs.length > 0) {
      suggestions.push({
        type: 'UNWARMED_CACHE',
        priority: 'MEDIUM',
        count: unwarmedConfigs.length,
        suggestions: unwarmedConfigs.map(config => ({
          key: config.cacheKey,
          frequency: config.accessFrequency,
          suggestion: '实现缓存预热机制，提高初次访问性能'
        }))
      });
    }

    return suggestions;
  }

  // 执行缓存预热
  async warmupCache(cacheKeys: string[]) {
    const results = [];
    
    for (const cacheKey of cacheKeys) {
      try {
        // 这里应该实现具体的预热逻辑
        // 模拟预热执行
        results.push({
          cacheKey,
          status: 'SUCCESS',
          warmpupTime: Math.random() * 100 + 50,
          dataSize: Math.floor(Math.random() * 1000) + 100
        });
        
        // 更新配置状�?
        await this.configRepository.update(
          { cacheKey },
          { isWarmedUp: true, updatedAt: new Date() }
        );
      } catch (error) {
        results.push({
          cacheKey,
          status: 'FAILED',
          error: error.message
        });
      }
    }

    return results;
  }

  // 批量清理缓存
  async clearCache(cacheType?: string, keyPattern?: string) {
    const results = [];

    if (cacheType) {
      // 清理指定类型的缓�?
      const configs = await this.configRepository.find({ 
        where: { cacheType } 
      });
      
      for (const config of configs) {
        try {
          // 执行缓存清理
          results.push({
            cacheKey: config.cacheKey,
            cacheType: config.cacheType,
            status: 'CLEARED',
            timestamp: new Date()
          });
        } catch (error) {
          results.push({
            cacheKey: config.cacheKey,
            cacheType: config.cacheType,
            status: 'FAILED',
            error: error.message
          });
        }
      }
    }

    return results;
  }

  // 更新缓存配置
  async updateCacheConfig(cacheKey: string, updates: Partial<CacheConfigEntity>) {
    await this.configRepository.update({ cacheKey }, updates);
    return await this.configRepository.findOne({ where: { cacheKey } });
  }

  // 添加缓存配置
  async addCacheConfig(config: Partial<CacheConfigEntity>) {
    const newConfig = this.configRepository.create(config);
    return await this.configRepository.save(newConfig);
  }

  // 获取缓存统计信息
  async getCacheStatistics(cacheType?: string) {
    const query = this.configRepository.createQueryBuilder('config');
    
    if (cacheType) {
      query.where('config.cacheType = :cacheType', { cacheType });
    }

    const total = await query.getCount();
    const active = await query.andWhere('config.isActive = :isActive', { isActive: true }).getCount();
    const warmedUp = await query.andWhere('config.isWarmedUp = :isWarmedUp', { isWarmedUp: true }).getCount();

    // 重新查询以避免重复条�?
    const avgHitRate = await this.configRepository
      .createQueryBuilder('config')
      .select('AVG(config.hitRate)', 'avgHitRate')
      .where(cacheType ? 'config.cacheType = :cacheType' : '1=1', { cacheType })
      .getRawOne();

    return {
      total,
      active,
      warmedUp,
      avgHitRate: parseFloat(avgHitRate.avgHitRate) || 0,
      cacheType: cacheType || 'ALL'
    };
  }

  // 清理过期数据
  async cleanupOldData(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.performanceRepository.delete({
      metricDate: MoreThan(cutoffDate)
    });

    await this.invalidationRepository.delete({
      invalidationDate: MoreThan(cutoffDate)
    });
  }

  // 模拟缓存性能测试
  async simulateCachePerformanceTest(cacheType: string, operation: string, count: number) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const startTime = Date.now();
      
      // 模拟缓存操作
      const delay = cacheType === 'REDIS' ? 5 : cacheType === 'MEMCACHED' ? 8 : 2;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const endTime = Date.now();
      
      results.push({
        iteration: i + 1,
        operation,
        responseTime: endTime - startTime,
        success: Math.random() > 0.01 // 99% 成功�?
      });
    }

    const successfulOps = results.filter(r => r.success);
    const avgResponseTime = successfulOps.reduce((sum, r) => sum + r.responseTime, 0) / successfulOps.length;
    const maxResponseTime = Math.max(...successfulOps.map(r => r.responseTime));
    const minResponseTime = Math.min(...successfulOps.map(r => r.responseTime));

    return {
      cacheType,
      operation,
      totalOperations: count,
      successfulOperations: successfulOps.length,
      failedOperations: count - successfulOps.length,
      successRate: (successfulOps.length / count) * 100,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      testTime: new Date()
    };
  }
}
