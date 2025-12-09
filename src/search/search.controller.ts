import { Controller, Get, Post, Delete, Query, Req, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 获取热门搜索
   */
  @Get('hot-words')
  @ApiOperation({ summary: '获取热门搜索关键词' })
  @ApiQuery({ name: 'count', description: '获取数量', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHotWords(@Query('count') count?: number) {
    return await this.searchService.getHotWords(count);
  }

  /**
   * 保存搜索历史
   */
  @Post('history')
  @ApiOperation({ summary: '保存搜索历史' })
  @ApiResponse({ status: 200, description: '保存成功' })
  async saveSearchHistory(
    @Body('keyword') keyword: string,
    @Body('userId') userId?: string,
    @Req() req?: any,
  ) {
    const userIp = req?.ip;
    const userAgent = req?.headers['user-agent'];
    await this.searchService.saveSearchHistory(keyword, userId, userIp, userAgent);
    return { message: '保存成功' };
  }

  /**
   * 获取搜索历史
   */
  @Get('history')
  @ApiOperation({ summary: '获取用户搜索历史' })
  @ApiQuery({ name: 'userId', description: '用户ID', required: true })
  @ApiQuery({ name: 'limit', description: '获取数量', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSearchHistory(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return await this.searchService.getSearchHistory(userId, limit);
  }

  /**
   * 清除搜索历史
   */
  @Delete('history')
  @ApiOperation({ summary: '清除用户搜索历史' })
  @ApiQuery({ name: 'userId', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '清除成功' })
  async clearSearchHistory(@Query('userId') userId: string) {
    await this.searchService.clearSearchHistory(userId);
    return { message: '清除成功' };
  }

  /**
   * 获取搜索联想
   */
  @Get('suggestions')
  @ApiOperation({ summary: '获取搜索联想' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词', required: true })
  @ApiQuery({ name: 'limit', description: '获取数量', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSearchSuggestions(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: number,
  ) {
    return await this.searchService.getSearchSuggestions(keyword, limit);
  }
}
