import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HotWordsService } from '../services/hot-words.service';
import { GoodsService } from '../services/goods.service';

@ApiTags('商品')
@Controller('buyer/goods/goods')
export class GoodsController {
  constructor(
    private readonly hotWordsService: HotWordsService,
    private readonly goodsService: GoodsService
  ) {}

  @Get('hot-words')
  getGoodsHotWords(@Query('count') count?: number) {
    const hotWords = this.hotWordsService.getHotWords(count);
    return {
      success: true,
      result: hotWords
    };
  }

  @Get('get/:goodsId')
  getGoods(@Param('goodsId') goodsId: string) {
    const goods = this.goodsService.getGoodsVO(goodsId);
    if (!goods) {
      return {
        success: false,
        message: '商品不存在'
      };
    }
    return {
      success: true,
      result: goods
    };
  }

  @Get('sku/:goodsId/:skuId')
  getSku(@Param('goodsId') goodsId: string, @Param('skuId') skuId: string) {
    const skuDetail = this.goodsService.getGoodsSkuDetail(goodsId, skuId);
    if (!skuDetail) {
      return {
        success: false,
        message: 'SKU不存在'
      };
    }
    return {
      success: true,
      result: skuDetail
    };
  }

  @Get()
  getGoodsList() {
    // 简化实现，返回所有商品
    const goodsList = this.goodsService.getAllGoods();
    return {
      success: true,
      result: {
        records: goodsList,
        total: goodsList.length,
        size: goodsList.length,
        current: 1,
        orders: [],
        optimizeCountSql: true,
        hitCount: false,
        countId: null,
        maxLimit: null,
        searchCount: true,
        pages: 1
      }
    };
  }

  @Get('sku')
  getSkuList() {
    // 简化实现，返回所有商品的SKU
    const skuList = this.goodsService.getAllSku();
    return {
      success: true,
      result: skuList
    };
  }

  @Get('es')
  getGoodsByPageFromEs(@Query() goodsSearchParams: any, @Query() pageVO: any) {
    // 简化实现，返回模拟的ES搜索结果
    const goodsList = this.goodsService.getAllGoods();
    return {
      success: true,
      result: {
        records: goodsList,
        total: goodsList.length,
        size: pageVO.size || goodsList.length,
        current: pageVO.current || 1,
        orders: [],
        optimizeCountSql: true,
        hitCount: false,
        countId: null,
        maxLimit: null,
        searchCount: true,
        pages: Math.ceil(goodsList.length / (pageVO.size || goodsList.length))
      }
    };
  }

  @Get('es/related')
  getGoodsRelatedByPageFromEs(@Query() goodsSearchParams: any, @Query() pageVO: any) {
    // 简化实现，返回模拟的ES相关搜索结果
    return {
      success: true,
      result: {
        brandVos: [
          { id: '1', name: '品牌1', logo: 'https://via.placeholder.com/100x100?text=Brand1' },
          { id: '2', name: '品牌2', logo: 'https://via.placeholder.com/100x100?text=Brand2' },
          { id: '3', name: '品牌3', logo: 'https://via.placeholder.com/100x100?text=Brand3' }
        ],
        categoryVos: [
          { id: '1', name: '分类1', parentId: '0' },
          { id: '2', name: '分类2', parentId: '0' },
          { id: '3', name: '分类3', parentId: '0' }
        ],
        specVos: [
          {
            id: '1',
            name: '颜色',
            specValueVos: [
              { id: '1', name: '红色' },
              { id: '2', name: '蓝色' },
              { id: '3', name: '黑色' }
            ]
          },
          {
            id: '2',
            name: '尺寸',
            specValueVos: [
              { id: '4', name: 'S' },
              { id: '5', name: 'M' },
              { id: '6', name: 'L' }
            ]
          }
        ]
      }
    };
  }
}