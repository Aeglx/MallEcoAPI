import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RecommendationService } from '../services/recommendation.service';

@ApiTags('推荐模块')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户推荐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ name: 'limit', description: '推荐数量', required: false })
  async getUserRecommendations(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return await this.recommendationService.getUserRecommendations(userId, limit);
  }

  @Post('preference')
  @ApiOperation({ summary: '更新用户偏好' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateUserPreference(@Body() body: any) {
    return await this.recommendationService.updateUserPreference(body);
  }

  @Get('popular')
  @ApiOperation({ summary: '获取热门推荐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', description: '推荐数量', required: false })
  async getPopularRecommendations(@Query('limit') limit?: number) {
    return await this.recommendationService.getPopularRecommendations(limit);
  }

  @Get('trending')
  @ApiOperation({ summary: '获取趋势推荐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', description: '推荐数量', required: false })
  async getTrendingRecommendations(@Query('limit') limit?: number) {
    return await this.recommendationService.getTrendingRecommendations(limit);
  }
}
