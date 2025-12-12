import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserBehavior } from './entities/user-behavior.entity';
import { RecommendationAlgorithm } from './entities/recommendation-algorithm.entity';
import { RecommendationLog } from './entities/recommendation-log.entity';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(UserBehavior)
    private readonly userBehaviorRepository: Repository<UserBehavior>,
    @InjectRepository(RecommendationAlgorithm)
    private readonly algorithmRepository: Repository<RecommendationAlgorithm>,
    @InjectRepository(RecommendationLog)
    private readonly logRepository: Repository<RecommendationLog>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 获取用户商品推荐
   */
  async getRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    const cacheKey = `recommendations:${userId}`;
    
    // 检查缓存
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as any[];
    }

    // 获取用户行为数据
    const userBehaviors = await this.userBehaviorRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    // 获取活跃的推荐算法
    const activeAlgorithms = await this.algorithmRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });

    let recommendations: any[] = [];

    // 应用推荐算法
    for (const algorithm of activeAlgorithms) {
      const algorithmResult = await this.applyAlgorithm(algorithm, userBehaviors, limit);
      recommendations = this.mergeRecommendations(recommendations, algorithmResult);
    }

    // 去重和排序
    recommendations = this.deduplicateAndSort(recommendations, limit);

    // 缓存结果
    await this.cacheManager.set(cacheKey, recommendations, 3600); // 1小时缓存

    // 记录推荐日志
    await this.logRecommendation(userId, recommendations, 'success');

    return recommendations;
  }

  /**
   * 应用推荐算法
   */
  private async applyAlgorithm(
    algorithm: RecommendationAlgorithm,
    behaviors: UserBehavior[],
    limit: number,
  ): Promise<any[]> {
    switch (algorithm.name) {
      case 'collaborative_filtering':
        return await this.collaborativeFiltering(behaviors, limit);
      case 'content_based':
        return await this.contentBasedFiltering(behaviors, limit);
      case 'popularity_based':
        return await this.popularityBased(limit);
      case 'real_time':
        return await this.realTimeRecommendation(behaviors, limit);
      default:
        return [];
    }
  }

  /**
   * 协同过滤算法
   */
  private async collaborativeFiltering(behaviors: UserBehavior[], limit: number): Promise<any[]> {
    // 实现协同过滤逻辑
    const viewedProducts = behaviors.map(b => b.productId);
    
    // 这里简化实现，实际应该基于用户相似度计算
    const similarUsers = await this.findSimilarUsers(behaviors[0]?.userId || 0, viewedProducts);
    
    return similarUsers.slice(0, limit).map(user => ({
      productId: user.productId,
      score: user.similarity,
      algorithm: 'collaborative_filtering',
    }));
  }

  /**
   * 基于内容的过滤
   */
  private async contentBasedFiltering(behaviors: UserBehavior[], limit: number): Promise<any[]> {
    // 基于用户历史行为的商品特征匹配
    const userPreferences = this.extractUserPreferences(behaviors);
    
    // 这里简化实现，实际应该基于商品特征匹配
    return userPreferences.slice(0, limit).map(pref => ({
      productId: pref.productId,
      score: pref.relevance,
      algorithm: 'content_based',
    }));
  }

  /**
   * 基于流行度的推荐
   */
  private async popularityBased(limit: number): Promise<any[]> {
    // 获取热门商品
    const popularProducts = await this.getPopularProducts(limit);
    
    return popularProducts.map(product => ({
      productId: product.id,
      score: product.popularityScore,
      algorithm: 'popularity_based',
    }));
  }

  /**
   * 实时推荐
   */
  private async realTimeRecommendation(behaviors: UserBehavior[], limit: number): Promise<any[]> {
    // 基于最近行为的实时推荐
    const recentBehaviors = behaviors.slice(0, 10);
    
    return recentBehaviors.slice(0, limit).map(behavior => ({
      productId: behavior.productId,
      score: 0.8, // 基于时间衰减的分数
      algorithm: 'real_time',
    }));
  }

  /**
   * 记录用户行为
   */
  async recordUserBehavior(userId: number, productId: number, behaviorType: string): Promise<void> {
    const behavior = this.userBehaviorRepository.create({
      userId,
      productId,
      behaviorType,
      createdAt: new Date(),
    });

    await this.userBehaviorRepository.save(behavior);

    // 清除相关缓存
    await this.cacheManager.del(`recommendations:${userId}`);
  }

  /**
   * 获取推荐效果统计
   */
  async getRecommendationStats(period: string = '7d'): Promise<any> {
    const startDate = this.calculateStartDate(period);
    
    const stats = await this.logRepository
      .createQueryBuilder('log')
      .select([
        'COUNT(*) as total_recommendations',
        'SUM(CASE WHEN log.clicked = true THEN 1 ELSE 0 END) as total_clicks',
        'AVG(CASE WHEN log.clicked = true THEN 1 ELSE 0 END) as click_rate',
      ])
      .where('log.createdAt >= :startDate', { startDate })
      .getRawOne();

    return {
      totalRecommendations: parseInt(stats.total_recommendations) || 0,
      totalClicks: parseInt(stats.total_clicks) || 0,
      clickRate: parseFloat(stats.click_rate) || 0,
      period,
    };
  }

  private async findSimilarUsers(userId: number, viewedProducts: number[]): Promise<any[]> {
    // 简化实现，实际应该基于用户行为模式计算相似度
    return [
      { productId: 1001, similarity: 0.85 },
      { productId: 1002, similarity: 0.78 },
      { productId: 1003, similarity: 0.72 },
    ];
  }

  private extractUserPreferences(behaviors: UserBehavior[]): any[] {
    // 提取用户偏好特征
    return behaviors.map(behavior => ({
      productId: behavior.productId,
      relevance: 0.9,
    }));
  }

  private async getPopularProducts(limit: number): Promise<any[]> {
    // 获取热门商品
    return [
      { id: 2001, popularityScore: 0.95 },
      { id: 2002, popularityScore: 0.89 },
      { id: 2003, popularityScore: 0.82 },
    ];
  }

  private mergeRecommendations(existing: any[], newItems: any[]): any[] {
    const merged = [...existing];
    
    for (const item of newItems) {
      const existingIndex = merged.findIndex(r => r.productId === item.productId);
      
      if (existingIndex >= 0) {
        // 合并分数（加权平均）
        merged[existingIndex].score = (merged[existingIndex].score + item.score) / 2;
      } else {
        merged.push(item);
      }
    }
    
    return merged;
  }

  private deduplicateAndSort(recommendations: any[], limit: number): any[] {
    // 按分数排序并去重
    const unique = recommendations.reduce((acc, current) => {
      const existing = acc.find(item => item.productId === current.productId);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return unique
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async logRecommendation(userId: number, recommendations: any[], status: string): Promise<void> {
    const log = this.logRepository.create({
      userId,
      recommendations: JSON.stringify(recommendations),
      status,
      createdAt: new Date(),
    });

    await this.logRepository.save(log);
  }

  private calculateStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1d':
        return new Date(now.setDate(now.getDate() - 1));
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }
}