import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 获取热门搜索关键词
   * @param limit 限制数量
   */
  @Get('hot-words')
  async getHotWords(@Query('limit') limit: string = '10') {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getHotWords(Number(limit))
    };
  }

  /**
   * 保存搜索历史
   * @param userId 用户ID
   * @param keyword 搜索关键词
   */
  @Post('history/save')
  async saveSearchHistory(@Body('userId') userId: string, @Body('keyword') keyword: string) {
    await this.searchService.saveSearchHistory(userId, keyword);
    return {
      code: 200,
      message: '保存成功'
    };
  }

  /**
   * 获取搜索历史
   * @param userId 用户ID
   * @param limit 限制数量
   */
  @Get('history/:userId')
  async getSearchHistory(@Param('userId') userId: string, @Query('limit') limit: string = '20') {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getSearchHistory(userId, Number(limit))
    };
  }

  /**
   * 清除搜索历史
   * @param userId 用户ID
   */
  @Post('history/clear/:userId')
  async clearSearchHistory(@Param('userId') userId: string) {
    await this.searchService.clearSearchHistory(userId);
    return {
      code: 200,
      message: '清除成功'
    };
  }

  /**
   * 获取搜索联想
   * @param keyword 搜索关键词
   * @param limit 限制数量
   */
  @Get('suggestions')
  async getSearchSuggestions(@Query('keyword') keyword: string, @Query('limit') limit: string = '10') {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.getSearchSuggestions(keyword, Number(limit))
    };
  }

  /**
   * 搜索商品
   * @param keyword 搜索关键词
   * @param page 页码
   * @param pageSize 每页数量
   * @param categoryId 分类ID
   * @param brandId 品牌ID
   * @param minPrice 最低价格
   * @param maxPrice 最高价格
   * @param isNew 是否新品
   * @param isHot 是否热门
   * @param recommend 是否推荐
   * @param sortBy 排序字段
   * @param sortOrder 排序顺序
   */
  @Get('products')
  async searchProducts(
    @Query('keyword') keyword: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('isNew') isNew?: string,
    @Query('isHot') isHot?: string,
    @Query('recommend') recommend?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.searchService.searchProducts(
        keyword,
        Number(page),
        Number(pageSize),
        categoryId,
        brandId,
        minPrice ? Number(minPrice) : undefined,
        maxPrice ? Number(maxPrice) : undefined,
        isNew ? Number(isNew) : undefined,
        isHot ? Number(isHot) : undefined,
        recommend ? Number(recommend) : undefined,
        sortBy,
        sortOrder
      )
    };
  }
}
