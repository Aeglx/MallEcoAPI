import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('推荐系统')
@Controller('recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户商品推荐', description: '基于用户行为数据生成个性化商品推荐' })
  @ApiResponse({ status: 200, description: '推荐商品列表' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserRecommendations(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 10,
  ) {
    const recommendations = await this.recommendationService.getRecommendations(
      parseInt(userId),
      limit,
    );
    
    return {
      success: true,
      data: recommendations,
      message: '推荐列表获取成功',
    };
  }

  @Post('behavior')
  @ApiOperation({ summary: '记录用户行为', description: '记录用户的浏览、点击、购买等行为数据' })
  @ApiResponse({ status: 201, description: '行为记录成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async recordUserBehavior(
    @Body() recordData: { userId: number; productId: number; behaviorType: string },
  ) {
    await this.recommendationService.recordUserBehavior(
      recordData.userId,
      recordData.productId,
      recordData.behaviorType,
    );
    
    return {
      success: true,
      message: '用户行为记录成功',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取推荐效果统计', description: '获取推荐系统的点击率、转化率等统计信息' })
  @ApiResponse({ status: 200, description: '统计信息' })
  async getRecommendationStats(@Query('period') period: string = '7d') {
    const stats = await this.recommendationService.getRecommendationStats(period);
    
    return {
      success: true,
      data: stats,
      message: '推荐统计获取成功',
    };
  }

  @Get('algorithms')
  @ApiOperation({ summary: '获取推荐算法列表', description: '获取当前使用的推荐算法及其配置' })
  @ApiResponse({ status: 200, description: '算法列表' })
  async getAlgorithms() {
    // 返回算法配置信息
    return {
      success: true,
      data: [
        {
          id: 1,
          name: 'collaborative_filtering',
          description: '协同过滤算法',
          weight: 0.4,
          isActive: true,
        },
        {
          id: 2,
          name: 'content_based',
          description: '基于内容的推荐',
          weight: 0.3,
          isActive: true,
        },
        {
          id: 3,
          name: 'popularity_based',
          description: '基于流行度的推荐',
          weight: 0.2,
          isActive: true,
        },
        {
          id: 4,
          name: 'real_time',
          description: '实时推荐',
          weight: 0.1,
          isActive: true,
        },
      ],
      message: '算法列表获取成功',
    };
  }

  @Post('algorithms/:id/toggle')
  @ApiOperation({ summary: '切换算法状态', description: '启用或禁用指定的推荐算法' })
  @ApiResponse({ status: 200, description: '状态切换成功' })
  @ApiResponse({ status: 404, description: '算法不存在' })
  async toggleAlgorithm(@Param('id') id: string) {
    // 实现算法状态切换逻辑
    return {
      success: true,
      message: `算法 ${id} 状态切换成功`,
    };
  }
}