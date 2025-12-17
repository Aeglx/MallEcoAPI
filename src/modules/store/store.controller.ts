import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('buyer/store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 获取店铺详情
  @Get('getStoreDetail')
  getStoreDetail(@Query('storeId') storeId: string) {
    return this.storeService.getStoreDetail(storeId);
  }

  // 获取店铺列表
  @Get('list')
  getStoreList(@Query() query: any) {
    return this.storeService.getStoreList(query);
  }

  // 获取店铺商品
  @Get('goods/list')
  getStoreGoods(@Query('storeId') storeId: string, @Query() query: any) {
    return this.storeService.getStoreGoods(storeId, query);
  }

  // 获取店铺分类
  @Get('goods/category/list')
  getStoreCategory(@Query('storeId') storeId: string) {
    return this.storeService.getStoreCategory(storeId);
  }

  // 关注店铺
  @Post('collection/add')
  addStoreCollection(@Body() body: { storeId: string }) {
    return this.storeService.addStoreCollection(body.storeId);
  }

  // 取消关注店铺
  @Post('collection/cancel')
  cancelStoreCollection(@Body() body: { storeId: string }) {
    return this.storeService.cancelStoreCollection(body.storeId);
  }

  // 获取关注店铺列表
  @Get('collection/list')
  getStoreCollectionList(@Query() query: any) {
    return this.storeService.getStoreCollectionList(query);
  }
}