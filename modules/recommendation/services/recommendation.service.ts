import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../entities/recommendation.entity';
import { UserBehavior } from '../entities/user-behavior.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(UserBehavior)
    private readonly userBehaviorRepository: Repository<UserBehavior>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 基于用户行为的推荐算法
   */
  async generateUserBasedRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // 从缓存中获取推荐结果
      const cacheKey = `recommendations:user:${userId}`;
      const cachedResult = await this.cacheManager.get(cacheKey);
      
      if (cachedResult) {
        this.logger.log(`从缓存获取用户 ${userId} 的推荐结果`);
        return cachedResult as any[];
      }

      // 获取用户行为数据
      const userBehaviors = await this.userBehaviorRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 100,
      });

      if (userBehaviors.length === 0) {
        // 如果没有用户行为，返回热门推荐
        return await this.generatePopularRecommendations(limit);
      }

      // 基于协同过滤的推荐算法
      const recommendations = await this.collaborativeFiltering(userId, userBehaviors, limit);
      
      // 缓存推荐结果（5分钟）
      await this.cacheManager.set(cacheKey, recommendations, 300000);
      
      return recommendations;
    } catch (error) {
      this.logger.error(`生成用户推荐失败: ${error.message}`);
      return await this.generatePopularRecommendations(limit);
    }
  }

  /**
   * 协同过滤推荐算法
   */
  private async collaborativeFiltering(
    userId: number,
    userBehaviors: UserBehavior[],
    limit: number,
  ): Promise<any[]> {
    // 简化版协同过滤算法
    // 实际项目中应该使用更复杂的算法，如矩阵分解等
    
    const viewedProducts = new Set(userBehaviors.map(b => b.productId));
    const userCategories = this.extractUserPreferences(userBehaviors);
    
    // 获取相似用户的行为数据
    const similarUsersBehaviors = await this.findSimilarUsers(userBehaviors, 5);
    
    // 合并推荐结果
    const recommendations = this.mergeRecommendations(
      userBehaviors,
      similarUsersBehaviors,
      viewedProducts,
      userCategories,
      limit,
    );

    return recommendations;
  }

  /**
   * 查找相似用户
   */
  private async findSimilarUsers(
    userBehaviors: UserBehavior[],
    maxSimilarUsers: number,
  ): Promise<UserBehavior[]> {
    // 简化版相似用户查找
    // 实际项目中应该使用更精确的相似度计算
    
    const userCategories = this.extractUserPreferences(userBehaviors);
    const query = this.userBehaviorRepository
      .createQueryBuilder('behavior')
      .where('behavior.userId != :userId', { userId: userBehaviors[0].userId })
      .andWhere('behavior.category IN (:...categories)', { categories: Array.from(userCategories) })
      .orderBy('behavior.createdAt', 'DESC')
      .limit(100);

    return await query.getMany();
  }

  /**
   * 提取用户偏好
   */
  private extractUserPreferences(userBehaviors: UserBehavior[]): Set<string> {
    const categories = new Set<string>();
    userBehaviors.forEach(behavior => {
      if (behavior.category) {
        categories.add(behavior.category);
      }
    });
    return categories;
  }

  /**
   * 合并推荐结果
   */
  private mergeRecommendations(
    userBehaviors: UserBehavior[],
    similarUsersBehaviors: UserBehavior[],
    viewedProducts: Set<number>,
    userCategories: Set<string>,
    limit: number,
  ): any[] {
    const productScores = new Map<number, number>();

    // 基于用户自身行为的推荐
    userBehaviors.forEach(behavior => {
      if (behavior.category && userCategories.has(behavior.category)) {
        const score = behavior.weight * this.getBehaviorWeight(behavior.behaviorType);
        productScores.set(behavior.productId, (productScores.get(behavior.productId) || 0) + score);
      }
    });

    // 基于相似用户行为的推荐
    similarUsersBehaviors.forEach(behavior => {
      if (!viewedProducts.has(behavior.productId)) {
        const score = behavior.weight * this.getBehaviorWeight(behavior.behaviorType) * 0.5;
        productScores.set(behavior.productId, (productScores.get(behavior.productId) || 0) + score);
      }
    });

    // 排序并返回结果
    return Array.from(productScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Math.min(1.0, score),
        type: 'user_based',
      }));
  }

  /**
   * 获取行为权重
   */
  private getBehaviorWeight(behaviorType: string): number {
    const weights = {
      purchase: 3.0,
      cart: 2.0,
      like: 1.5,
      click: 1.2,
      view: 1.0,
    };
    return weights[behaviorType] || 1.0;
  }

  /**
   * 生成热门推荐
   */
  async generatePopularRecommendations(limit: number = 10): Promise<any[]> {
    try {
      const cacheKey = 'recommendations:popular';
      const cachedResult = await this.cacheManager.get(cacheKey);
      
      if (cachedResult) {
        return cachedResult as any[];
      }

      // 基于用户行为统计的热门商品
      const popularProducts = await this.userBehaviorRepository
        .createQueryBuilder('behavior')
        .select('behavior.productId', 'productId')
        .addSelect('COUNT(*)', 'count')
        .addSelect('AVG(behavior.weight)', 'avgWeight')
        .groupBy('behavior.productId')
        .orderBy('count', 'DESC')
        .addOrderBy('avgWeight', 'DESC')
        .limit(limit)
        .getRawMany();

      const recommendations = popularProducts.map((item, index) => ({
        productId: item.productId,
        score: 1.0 - (index * 0.05), // 根据排名递减分数
        type: 'popular',
      }));

      // 缓存热门推荐（10分钟）
      await this.cacheManager.set(cacheKey, recommendations, 600000);
      
      return recommendations;
    } catch (error) {
      this.logger.error(`生成热门推荐失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 记录用户行为
   */
  async recordUserBehavior(userId: number, behaviorData: Partial<UserBehavior>): Promise<UserBehavior> {
    const behavior = this.userBehaviorRepository.create({
      userId,
      behaviorType: behaviorData.behaviorType || 'view',
      productId: behaviorData.productId,
      category: behaviorData.category,
      price: behaviorData.price,
      context: behaviorData.context,
      weight: behaviorData.weight || 1.0,
      behaviorTime: new Date(),
    });

    return await this.userBehaviorRepository.save(behavior);
  }

  /**
   * 获取用户行为历史
   */
  async getUserBehaviorHistory(userId: number, limit: number = 50): Promise<UserBehavior[]> {
    return await this.userBehaviorRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 清除用户推荐缓存
   */
  async clearUserRecommendationCache(userId: number): Promise<void> {
    const cacheKey = `recommendations:user:${userId}`;
    await this.cacheManager.del(cacheKey);
    this.logger.log(`已清除用户 ${userId} 的推荐缓存`);
  }
}