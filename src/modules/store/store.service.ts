import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
  
  // 获取店铺详情
  getStoreDetail(storeId: string) {
    return {
      code: 200,
      message: '操作成功',
      result: {
        id: storeId,
        storeName: '示例店铺',
        storeLogo: '/images/store/default.jpg',
        storeDesc: '这是一家优质的店铺',
        storeScore: 4.8,
        salesVolume: 1000,
        isCollection: false,
        createTime: '2024-01-01 00:00:00'
      }
    };
  }

  // 获取店铺列表
  getStoreList(query: any) {
    return {
      code: 200,
      message: '操作成功',
      result: {
        records: [
          {
            id: '1',
            storeName: '店铺1',
            storeLogo: '/images/store/store1.jpg',
            storeScore: 4.5,
            salesVolume: 500,
            isCollection: false
          },
          {
            id: '2',
            storeName: '店铺2',
            storeLogo: '/images/store/store2.jpg',
            storeScore: 4.8,
            salesVolume: 800,
            isCollection: true
          }
        ],
        total: 2,
        size: query.size || 10,
        current: query.current || 1
      }
    };
  }

  // 获取店铺商品
  getStoreGoods(storeId: string, query: any) {
    return {
      code: 200,
      message: '操作成功',
      result: {
        records: [
          {
            id: '1',
            goodsName: '商品1',
            price: 100,
            originalPrice: 120,
            sales: 50,
            thumbnail: '/images/goods/goods1.jpg'
          }
        ],
        total: 1,
        size: query.size || 10,
        current: query.current || 1
      }
    };
  }

  // 获取店铺分类
  getStoreCategory(storeId: string) {
    return {
      code: 200,
      message: '操作成功',
      result: [
        {
          id: '1',
          name: '分类1',
          parentId: '0'
        },
        {
          id: '2',
          name: '分类2',
          parentId: '0'
        }
      ]
    };
  }

  // 关注店铺
  addStoreCollection(storeId: string) {
    return {
      code: 200,
      message: '关注成功',
      result: null
    };
  }

  // 取消关注店铺
  cancelStoreCollection(storeId: string) {
    return {
      code: 200,
      message: '取消关注成功',
      result: null
    };
  }

  // 获取关注店铺列表
  getStoreCollectionList(query: any) {
    return {
      code: 200,
      message: '操作成功',
      result: {
        records: [
          {
            id: '2',
            storeName: '店铺2',
            storeLogo: '/images/store/store2.jpg',
            storeScore: 4.8,
            salesVolume: 800,
            isCollection: true
          }
        ],
        total: 1,
        size: query.size || 10,
        current: query.current || 1
      }
    };
  }
}