import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { RecommendationService } from '../services/recommendation.service';
import { UserBehavior } from '../entities/user-behavior.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * 获取用户个性化推荐
   */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserRecommendations(
    @Param('userId') userId: number,
    @Query('limit') limit: number = 10,
  ) {
    try {
      if (isNaN(userId) || userId <= 0) {
        throw new HttpException('用户ID无效', HttpStatus.BAD_REQUEST);
      }

      const recommendations = await this.recommendationService.generateUserBasedRecommendations(
        userId,
        limit,
      );

      return {
        success: true,
        data: {
          userId,
          recommendations,
          count: recommendations.length,
        },
        message: '获取推荐成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `获取推荐失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取热门推荐
   */
  @Get('popular')
  async getPopularRecommendations(@Query('limit') limit: number = 10) {
    try {
      const recommendations = await this.recommendationService.generatePopularRecommendations(limit);

      return {
        success: true,
        data: {
          recommendations,
          count: recommendations.length,
        },
        message: '获取热门推荐成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `获取热门推荐失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 记录用户行为
   */
  @Post('behavior')
  @UseGuards(JwtAuthGuard)
  async recordUserBehavior(@Body() behaviorData: Partial<UserBehavior>) {
    try {
      const { userId, behaviorType, productId } = behaviorData;

      if (!userId || !behaviorType || !productId) {
        throw new HttpException('用户ID、行为类型和商品ID不能为空', HttpStatus.BAD_REQUEST);
      }

      const behavior = await this.recommendationService.recordUserBehavior(userId, behaviorData);

      // 清除用户推荐缓存，以便下次获取最新推荐
      await this.recommendationService.clearUserRecommendationCache(userId);

      return {
        success: true,
        data: behavior,
        message: '记录用户行为成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `记录用户行为失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取用户行为历史
   */
  @Get('behavior/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserBehaviorHistory(
    @Param('userId') userId: number,
    @Query('limit') limit: number = 50,
  ) {
    try {
      if (isNaN(userId) || userId <= 0) {
        throw new HttpException('用户ID无效', HttpStatus.BAD_REQUEST);
      }

      const behaviors = await this.recommendationService.getUserBehaviorHistory(userId, limit);

      return {
        success: true,
        data: {
          userId,
          behaviors,
          count: behaviors.length,
        },
        message: '获取用户行为历史成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `获取用户行为历史失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 清除用户推荐缓存
   */
  @Post('cache/clear/:userId')
  @UseGuards(JwtAuthGuard)
  async clearUserRecommendationCache(@Param('userId') userId: number) {
    try {
      if (isNaN(userId) || userId <= 0) {
        throw new HttpException('用户ID无效', HttpStatus.BAD_REQUEST);
      }

      await this.recommendationService.clearUserRecommendationCache(userId);

      return {
        success: true,
        message: '清除推荐缓存成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `清除推荐缓存失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}