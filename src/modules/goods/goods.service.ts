import { Injectable } from '@nestjs/common';

@Injectable()
export class GoodsService {
  // 获取商品详情
  async getGoodsDetail(goodsId: string) {
    return {
      code: 200,
      message: '获取商品详情成功',
      data: {
        goodsId,
        name: '示例商品',
        price: 99.9,
        stock: 100,
        description: '这是一个示例商品',
      },
    };
  }

  // 获取商品列表
  async getGoodsList(query: any) {
    return {
      code: 200,
      message: '获取商品列表成功',
      data: {
        list: [
          {
            goodsId: '1',
            name: '商品1',
            price: 99.9,
            stock: 100,
          },
          {
            goodsId: '2',
            name: '商品2',
            price: 199.9,
            stock: 50,
          },
        ],
        total: 2,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 获取商品分类
  async getCategoryList(query: any) {
    return {
      code: 200,
      message: '获取商品分类成功',
      data: {
        list: [
          {
            categoryId: '1',
            name: '分类1',
            parentId: '0',
          },
          {
            categoryId: '2',
            name: '分类2',
            parentId: '0',
          },
        ],
      },
    };
  }

  // 获取商品规格
  async getSkuList(goodsId: string) {
    return {
      code: 200,
      message: '获取商品规格成功',
      data: {
        goodsId,
        skuList: [
          {
            skuId: '1',
            spec: '规格1',
            price: 99.9,
            stock: 100,
          },
          {
            skuId: '2',
            spec: '规格2',
            price: 109.9,
            stock: 80,
          },
        ],
      },
    };
  }

  // 搜索商品
  async searchGoods(query: any) {
    return {
      code: 200,
      message: '搜索商品成功',
      data: {
        list: [
          {
            goodsId: '1',
            name: '搜索商品1',
            price: 99.9,
            stock: 100,
          },
          {
            goodsId: '2',
            name: '搜索商品2',
            price: 199.9,
            stock: 50,
          },
        ],
        total: 2,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 获取商品评价
  async getGoodsEvaluation(goodsId: string, query: any) {
    return {
      code: 200,
      message: '获取商品评价成功',
      data: {
        goodsId,
        evaluationList: [
          {
            evaluationId: '1',
            content: '商品很好',
            rating: 5,
            createTime: '2024-01-01',
          },
        ],
        total: 1,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 获取商品咨询
  async getGoodsConsultation(goodsId: string, query: any) {
    return {
      code: 200,
      message: '获取商品咨询成功',
      data: {
        goodsId,
        consultationList: [
          {
            consultationId: '1',
            question: '这个商品有现货吗？',
            answer: '有现货，可以立即发货',
            createTime: '2024-01-01',
          },
        ],
        total: 1,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 添加商品咨询
  async addGoodsConsultation(body: any) {
    return {
      code: 200,
      message: '添加商品咨询成功',
      data: {
        consultationId: 'new_1',
        ...body,
      },
    };
  }

  // 获取商品收藏列表
  async getGoodsCollectionList(query: any) {
    return {
      code: 200,
      message: '获取商品收藏列表成功',
      data: {
        list: [
          {
            collectionId: '1',
            goodsId: '1',
            goodsName: '收藏商品1',
            price: 99.9,
            createTime: '2024-01-01',
          },
        ],
        total: 1,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 添加商品收藏
  async addGoodsCollection(goodsId: string) {
    return {
      code: 200,
      message: '添加商品收藏成功',
      data: {
        collectionId: 'new_1',
        goodsId,
      },
    };
  }

  // 取消商品收藏
  async cancelGoodsCollection(goodsId: string) {
    return {
      code: 200,
      message: '取消商品收藏成功',
      data: {
        goodsId,
      },
    };
  }
}
