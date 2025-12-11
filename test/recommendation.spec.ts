import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RecommendationController } from '../modules/recommendation/controllers/recommendation.controller';
import { RecommendationService } from '../modules/recommendation/services/recommendation.service';
import { Recommendation } from '../modules/recommendation/entities/recommendation.entity';
import { UserBehavior } from '../modules/recommendation/entities/user-behavior.entity';

describe('RecommendationController', () => {
  let controller: RecommendationController;
  let service: RecommendationService;

  const mockRecommendationRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockUserBehaviorRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationController],
      providers: [
        RecommendationService,
        {
          provide: getRepositoryToken(Recommendation),
          useValue: mockRecommendationRepository,
        },
        {
          provide: getRepositoryToken(UserBehavior),
          useValue: mockUserBehaviorRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<RecommendationController>(RecommendationController);
    service = module.get<RecommendationService>(RecommendationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRecommendations', () => {
    it('should return user recommendations successfully', async () => {
      const userId = 1;
      const limit = 5;
      const mockRecommendations = [
        { productId: 1, score: 0.95, type: 'user_based' },
        { productId: 2, score: 0.88, type: 'user_based' },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockUserBehaviorRepository.find.mockResolvedValue([
        { userId: 1, productId: 1, behaviorType: 'view', category: 'electronics' },
      ]);
      mockUserBehaviorRepository.createQueryBuilder().getMany.mockResolvedValue([
        { userId: 2, productId: 2, behaviorType: 'purchase', category: 'electronics' },
      ]);

      const result = await controller.getUserRecommendations(userId, limit);

      expect(result.success).toBe(true);
      expect(result.data.userId).toBe(userId);
      expect(result.data.recommendations.length).toBeGreaterThan(0);
      expect(result.message).toBe('获取推荐成功');
    });

    it('should handle invalid user ID', async () => {
      const invalidUserId = -1;

      await expect(controller.getUserRecommendations(invalidUserId, 10))
        .rejects
        .toThrow('用户ID无效');
    });
  });

  describe('getPopularRecommendations', () => {
    it('should return popular recommendations successfully', async () => {
      const limit = 5;
      const mockRecommendations = [
        { productId: 1, score: 0.95, type: 'popular' },
        { productId: 2, score: 0.90, type: 'popular' },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockUserBehaviorRepository.createQueryBuilder().getRawMany.mockResolvedValue([
        { productId: 1, count: '100', avgWeight: '1.5' },
        { productId: 2, count: '80', avgWeight: '1.3' },
      ]);

      const result = await controller.getPopularRecommendations(limit);

      expect(result.success).toBe(true);
      expect(result.data.recommendations.length).toBeGreaterThan(0);
      expect(result.message).toBe('获取热门推荐成功');
    });
  });

  describe('recordUserBehavior', () => {
    it('should record user behavior successfully', async () => {
      const behaviorData = {
        userId: 1,
        behaviorType: 'view',
        productId: 123,
        category: 'electronics',
        weight: 1.0,
      };

      const mockBehavior = {
        id: 1,
        ...behaviorData,
        createdAt: new Date(),
      };

      mockUserBehaviorRepository.create.mockReturnValue(mockBehavior);
      mockUserBehaviorRepository.save.mockResolvedValue(mockBehavior);

      const result = await controller.recordUserBehavior(behaviorData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBehavior);
      expect(result.message).toBe('记录用户行为成功');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        userId: 1,
        // missing behaviorType and productId
      };

      await expect(controller.recordUserBehavior(incompleteData))
        .rejects
        .toThrow('用户ID、行为类型和商品ID不能为空');
    });
  });

  describe('getUserBehaviorHistory', () => {
    it('should return user behavior history successfully', async () => {
      const userId = 1;
      const limit = 10;
      const mockBehaviors = [
        { id: 1, userId: 1, behaviorType: 'view', productId: 123 },
        { id: 2, userId: 1, behaviorType: 'click', productId: 124 },
      ];

      mockUserBehaviorRepository.find.mockResolvedValue(mockBehaviors);

      const result = await controller.getUserBehaviorHistory(userId, limit);

      expect(result.success).toBe(true);
      expect(result.data.userId).toBe(userId);
      expect(result.data.behaviors).toEqual(mockBehaviors);
      expect(result.message).toBe('获取用户行为历史成功');
    });
  });

  describe('clearUserRecommendationCache', () => {
    it('should clear user recommendation cache successfully', async () => {
      const userId = 1;

      const result = await controller.clearUserRecommendationCache(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('清除推荐缓存成功');
    });
  });
});