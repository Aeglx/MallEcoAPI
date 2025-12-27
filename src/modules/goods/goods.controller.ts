import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoodsService } from './goods.service';

@ApiTags('商品')
@Controller('buyer/goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  // 获取商品详情
  @Get('getGoodsDetail')
  getGoodsDetail(@Query('goodsId') goodsId: string) {
    return this.goodsService.getGoodsDetail(goodsId);
  }

  // 获取商品列表
  @Get('list')
  getGoodsList(@Query() query: any) {
    return this.goodsService.getGoodsList(query);
  }

  // 获取商品分类
  @Get('category/list')
  getCategoryList(@Query() query: any) {
    return this.goodsService.getCategoryList(query);
  }

  // 获取商品规格
  @Get('sku/list')
  getSkuList(@Query('goodsId') goodsId: string) {
    return this.goodsService.getSkuList(goodsId);
  }

  // 搜索商品
  @Get('search')
  searchGoods(@Query() query: any) {
    return this.goodsService.searchGoods(query);
  }

  // 获取商品评价
  @Get('evaluation/page')
  getGoodsEvaluation(@Query('goodsId') goodsId: string, @Query() query: any) {
    return this.goodsService.getGoodsEvaluation(goodsId, query);
  }

  // 获取商品咨询
  @Get('consultation/page')
  getGoodsConsultation(@Query('goodsId') goodsId: string, @Query() query: any) {
    return this.goodsService.getGoodsConsultation(goodsId, query);
  }

  // 添加商品咨询
  @Post('consultation/add')
  addGoodsConsultation(@Body() body: any) {
    return this.goodsService.addGoodsConsultation(body);
  }

  // 获取商品收藏列表
  @Get('collection/list')
  getGoodsCollectionList(@Query() query: any) {
    return this.goodsService.getGoodsCollectionList(query);
  }

  // 添加商品收藏
  @Post('collection/add')
  addGoodsCollection(@Body() body: { goodsId: string }) {
    return this.goodsService.addGoodsCollection(body.goodsId);
  }

  // 取消商品收藏
  @Post('collection/cancel')
  cancelGoodsCollection(@Body() body: { goodsId: string }) {
    return this.goodsService.cancelGoodsCollection(body.goodsId);
  }
}
