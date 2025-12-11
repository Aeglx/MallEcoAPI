import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GoodsService } from '../services/goods.service';
import { GoodsEntity } from '../entities/goods.entity';

@ApiTags('商品管理')
@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功', type: GoodsEntity })
  async createGoods(@Body() goodsData: {
    goodsName: string;
    goodsSn: string;
    categoryId: string;
    brandId?: string;
    storeId: string;
    marketPrice: number;
    price: number;
    costPrice: number;
    stock: number;
    stockWarning: number;
    weight?: number;
    volume?: number;
    goodsBrief?: string;
    goodsDesc?: string;
    goodsThumb?: string;
    goodsImg?: string[];
    isOnSale?: boolean;
    isBest?: boolean;
    isNew?: boolean;
    isHot?: boolean;
    isFreeShipping?: boolean;
    isVirtual?: boolean;
    isTimePromotion?: boolean;
    isSeckill?: boolean;
    isGroupBuy?: boolean;
    sortOrder?: number;
    saleNum?: number;
    commentNum?: number;
    specList?: Array<{
      specName: string;
      specValue: string;
      price: number;
      costPrice: number;
      marketPrice: number;
      stock: number;
      skuSn?: string;
      weight?: number;
      specImg?: string;
    }>;
  }) {
    return await this.goodsService.createGoods(goodsData);
  }

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  @ApiQuery({ name: 'goodsName', required: false, description: '商品名称' })
  @ApiQuery({ name: 'isOnSale', required: false, description: '是否上架' })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌ID' })
  async getGoodsList(@Query() params: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    storeId?: string;
    goodsName?: string;
    isOnSale?: boolean;
    brandId?: string;
  }) {
    return await this.goodsService.getGoodsList(params);
  }

  @Get(':goodsId')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: GoodsEntity })
  async getGoodsById(@Param('goodsId') goodsId: string) {
    return await this.goodsService.getGoodsById(goodsId);
  }

  @Get('sn/:goodsSn')
  @ApiOperation({ summary: '根据商品编号获取商品' })
  @ApiParam({ name: 'goodsSn', description: '商品编号' })
  @ApiResponse({ status: 200, description: '获取成功', type: GoodsEntity })
  async getGoodsBySn(@Param('goodsSn') goodsSn: string) {
    return await this.goodsService.getGoodsBySn(goodsSn);
  }

  @Put(':goodsId')
  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: GoodsEntity })
  async updateGoods(
    @Param('goodsId') goodsId: string,
    @Body() updateData: Partial<GoodsEntity>
  ) {
    return await this.goodsService.updateGoods(goodsId, updateData);
  }

  @Delete(':goodsId')
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteGoods(@Param('goodsId') goodsId: string) {
    return await this.goodsService.deleteGoods(goodsId);
  }

  @Post(':goodsId/onSale')
  @ApiOperation({ summary: '上架商品' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '上架成功' })
  async onSaleGoods(@Param('goodsId') goodsId: string) {
    return await this.goodsService.onSaleGoods(goodsId);
  }

  @Post(':goodsId/offSale')
  @ApiOperation({ summary: '下架商品' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '下架成功' })
  async offSaleGoods(@Param('goodsId') goodsId: string) {
    return await this.goodsService.offSaleGoods(goodsId);
  }

  @Post(':goodsId/stock')
  @ApiOperation({ summary: '更新商品库存' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '库存更新成功' })
  async updateGoodsStock(
    @Param('goodsId') goodsId: string,
    @Body() data: { stock: number; skuId?: string; type: 'increase' | 'decrease' | 'set' }
  ) {
    return await this.goodsService.updateGoodsStock(goodsId, data);
  }

  @Get(':goodsId/specs')
  @ApiOperation({ summary: '获取商品规格列表' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  async getGoodsSpecs(@Param('goodsId') goodsId: string) {
    return await this.goodsService.getGoodsSpecs(goodsId);
  }

  @Post(':goodsId/specs')
  @ApiOperation({ summary: '添加商品规格' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 201, description: '规格添加成功' })
  async addGoodsSpec(
    @Param('goodsId') goodsId: string,
    @Body() specData: {
      specName: string;
      specValue: string;
      price: number;
      costPrice: number;
      marketPrice: number;
      stock: number;
      skuSn?: string;
      weight?: number;
      specImg?: string;
    }
  ) {
    return await this.goodsService.addGoodsSpec(goodsId, specData);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: '获取分类商品列表' })
  @ApiParam({ name: 'categoryId', description: '分类ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getGoodsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.goodsService.getGoodsByCategory(categoryId, params);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '获取店铺商品列表' })
  @ApiParam({ name: 'storeId', description: '店铺ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getGoodsByStore(
    @Param('storeId') storeId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.goodsService.getGoodsByStore(storeId, params);
  }

  @Get('search')
  @ApiOperation({ summary: '搜索商品' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌ID' })
  @ApiQuery({ name: 'priceMin', required: false, description: '最低价格' })
  @ApiQuery({ name: 'priceMax', required: false, description: '最高价格' })
  async searchGoods(@Query() params: {
    keyword: string;
    page?: number;
    pageSize?: number;
    categoryId?: string;
    brandId?: string;
    priceMin?: number;
    priceMax?: number;
  }) {
    return await this.goodsService.searchGoods(params);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门商品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制' })
  async getHotGoods(@Query('limit') limit?: number) {
    return await this.goodsService.getHotGoods(limit || 10);
  }

  @Get('new')
  @ApiOperation({ summary: '获取新品商品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制' })
  async getNewGoods(@Query('limit') limit?: number) {
    return await this.goodsService.getNewGoods(limit || 10);
  }

  @Get('recommend')
  @ApiOperation({ summary: '获取推荐商品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制' })
  async getRecommendGoods(@Query('limit') limit?: number) {
    return await this.goodsService.getRecommendGoods(limit || 10);
  }

  @Post(':goodsId/collect')
  @ApiOperation({ summary: '收藏商品' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '收藏成功' })
  async collectGoods(@Param('goodsId') goodsId: string, @Request() req) {
    const memberId = req.user?.sub;
    return await this.goodsService.collectGoods(memberId, goodsId);
  }

  @Delete(':goodsId/collect')
  @ApiOperation({ summary: '取消收藏商品' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '取消收藏成功' })
  async uncollectGoods(@Param('goodsId') goodsId: string, @Request() req) {
    const memberId = req.user?.sub;
    return await this.goodsService.uncollectGoods(memberId, goodsId);
  }

  @Get(':goodsId/comments')
  @ApiOperation({ summary: '获取商品评论列表' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getGoodsComments(
    @Param('goodsId') goodsId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.goodsService.getGoodsComments(goodsId, params);
  }

  @Get('statistics/:goodsId')
  @ApiOperation({ summary: '获取商品统计信息' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  async getGoodsStatistics(@Param('goodsId') goodsId: string) {
    return await this.goodsService.getGoodsStatistics(goodsId);
  }
}