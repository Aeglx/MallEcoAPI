import { Controller, Get, Post, Query, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchProductDto, SearchProductResponseDto } from './dto/search-product.dto';
import { SearchSuggestDto, SearchSuggestResponseDto } from './dto/search-suggest.dto';
import { SaveSearchHistoryDto, GetSearchHistoryDto, SearchHistoryResponseDto } from './dto/search-history.dto';
import { SearchStatisticsDto, SearchTrendResponseDto, HotWordStatisticsResponseDto } from './dto/search-statistics.dto';

@ApiTags('搜索模块')
@Controller('search')
@UsePipes(new ValidationPipe({ transform: true }))
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 获取热门搜索关键词
   * @param limit 限制数量
   */
  @Get('hot-words')
  @ApiOperation({ summary: '获取热门搜索关键词' })
  @ApiResponse({ status: 200, description: '成功获取热门搜索关键词' })
  async getHotWords(@Query('limit') limit: string = '10') {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getHotWords(Number(limit))
    };
  }

  /**
   * 保存搜索历史
   * @param saveSearchHistoryDto 保存搜索历史DTO
   */
  @Post('history/save')
  @ApiOperation({ summary: '保存搜索历史' })
  @ApiResponse({ status: 200, description: '成功保存搜索历史' })
  async saveSearchHistory(@Body() saveSearchHistoryDto: SaveSearchHistoryDto) {
    await this.searchService.saveSearchHistory(saveSearchHistoryDto.userId, saveSearchHistoryDto.keyword);
    return {
      code: 200,
      message: '保存成功'
    };
  }

  /**
   * 获取搜索历史
   * @param userId 用户ID
   * @param getSearchHistoryDto 获取搜索历史DTO
   */
  @Get('history/:userId')
  @ApiOperation({ summary: '获取搜索历史' })
  @ApiResponse({ status: 200, description: '成功获取搜索历史', type: SearchHistoryResponseDto })
  async getSearchHistory(@Param('userId') userId: string, @Query() getSearchHistoryDto: GetSearchHistoryDto) {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getSearchHistory(userId, getSearchHistoryDto.limit)
    };
  }

  /**
   * 清除搜索历史
   * @param userId 用户ID
   */
  @Post('history/clear/:userId')
  @ApiOperation({ summary: '清除搜索历史' })
  @ApiResponse({ status: 200, description: '成功清除搜索历史' })
  async clearSearchHistory(@Param('userId') userId: string) {
    await this.searchService.clearSearchHistory(userId);
    return {
      code: 200,
      message: '清除成功'
    };
  }

  /**
   * 获取搜索联想
   * @param searchSuggestDto 搜索联想DTO
   */
  @Get('suggestions')
  @ApiOperation({ summary: '获取搜索联想' })
  @ApiResponse({ status: 200, description: '成功获取搜索联想', type: SearchSuggestResponseDto })
  async getSearchSuggestions(@Query() searchSuggestDto: SearchSuggestDto) {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getSearchSuggestions(searchSuggestDto.keyword, searchSuggestDto.limit)
    };
  }

  /**
   * 搜索商品
   * @param searchProductDto 搜索商品DTO
   */
  @Get('products')
  @ApiOperation({ summary: '搜索商品' })
  @ApiResponse({ status: 200, description: '成功搜索商品', type: SearchProductResponseDto })
  async searchProducts(@Query() searchProductDto: SearchProductDto) {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.searchProducts(
        searchProductDto.keyword,
        searchProductDto.page,
        searchProductDto.pageSize,
        searchProductDto.categoryId,
        searchProductDto.brandId,
        searchProductDto.minPrice,
        searchProductDto.maxPrice,
        searchProductDto.isNew,
        searchProductDto.isHot,
        searchProductDto.recommend,
        searchProductDto.sortBy,
        searchProductDto.sortOrder
      )
    };
  }

  /**
   * 获取搜索趋势统计
   * @param searchStatisticsDto 搜索统计DTO
   */
  @Get('statistics/trend')
  @ApiOperation({ summary: '获取搜索趋势统计' })
  @ApiResponse({ status: 200, description: '成功获取搜索趋势统计', type: [SearchTrendResponseDto] })
  async getSearchTrend(@Query() searchStatisticsDto: SearchStatisticsDto) {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getSearchTrend(searchStatisticsDto)
    };
  }

  /**
   * 获取热门搜索词统计
   * @param limit 限制数量
   */
  @Get('statistics/hot-words')
  @ApiOperation({ summary: '获取热门搜索词统计' })
  @ApiResponse({ status: 200, description: '成功获取热门搜索词统计', type: [HotWordStatisticsResponseDto] })
  async getHotWordStatistics(@Query('limit') limit: string = '10') {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getHotWordStatistics(Number(limit))
    };
  }

  /**
   * 获取搜索转化率统计
   */
  @Get('statistics/conversion')
  @ApiOperation({ summary: '获取搜索转化率统计' })
  async getSearchConversionStatistics() {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getSearchConversionStatistics()
    };
  }
}
