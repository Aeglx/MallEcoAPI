import { Injectable } from '@nestjs/common';

@Injectable()
export class GoodsService {
  private goodsData = [
    {
      id: '1',
      goodsName: '手机',
      price: 1999.00,
      brandId: '1',
      categoryPath: '1/2/3',
      goodsUnit: '台',
      sellingPoint: '高性能手机',
      marketEnable: 'UPPER',
      intro: '<p>这是一款高性能手机</p>',
      buyCount: 100,
      quantity: 500,
      grade: 100.0,
      thumbnail: '/images/phone-thumb.jpg',
      small: '/images/phone-small.jpg',
      original: '/images/phone-original.jpg',
      storeCategoryPath: '1/2',
      commentNum: 20,
      storeId: '1',
      storeName: '手机旗舰店',
      templateId: '1',
      selfOperated: true,
      mobileIntro: '<p>手机移动端详情</p>',
      goodsVideo: '',
      recommend: true,
      salesModel: 'NORMAL',
      goodsType: 'PHYSICAL_GOODS',
      params: '[]',
      categoryName: ['手机数码', '手机', '智能手机'],
      goodsParamsDTOList: [],
      goodsGalleryList: ['/images/phone1.jpg', '/images/phone2.jpg', '/images/phone3.jpg'],
      skuList: [
        {
          id: '1',
          goodsId: '1',
          specs: '{"样式": "全网通", "颜色": "黑色"}',
          simpleSpecs: '样式:全网通,颜色:黑色',
          freightTemplateId: '1',
          promotionFlag: false,
          promotionPrice: null,
          goodsName: '手机',
          sn: 'PHONE001',
          brandId: '1',
          categoryPath: '1/2/3',
          goodsUnit: '台',
          sellingPoint: '高性能手机',
          weight: 0.5,
          marketEnable: 'UPPER',
          intro: '<p>这是一款高性能手机</p>',
          price: 1999.00,
          cost: 1500.00,
          viewCount: 1000,
          buyCount: 50,
          quantity: 200,
          grade: 100.0,
          thumbnail: '/images/phone-black-thumb.jpg',
          big: '/images/phone-black-big.jpg',
          small: '/images/phone-black-small.jpg',
          original: '/images/phone-black-original.jpg',
          storeCategoryPath: '1/2',
          commentNum: 10,
          storeId: '1',
          storeName: '手机旗舰店',
          templateId: '1',
          authFlag: 'PASS',
          authMessage: '',
          underMessage: '',
          selfOperated: true,
          mobileIntro: '<p>手机移动端详情</p>',
          goodsVideo: '',
          recommend: true,
          salesModel: 'NORMAL',
          goodsType: 'PHYSICAL_GOODS',
          alertQuantity: 10,
          specList: [
            {
              specName: '样式',
              specValue: '全网通',
              specType: 0,
              specImage: []
            },
            {
              specName: '颜色',
              specValue: '黑色',
              specType: 1,
              specImage: ['/images/color-black.jpg']
            }
          ],
          goodsGalleryList: ['/images/phone-black1.jpg', '/images/phone-black2.jpg']
        },
        {
          id: '2',
          goodsId: '1',
          specs: '{"样式": "全网通", "颜色": "白色"}',
          simpleSpecs: '样式:全网通,颜色:白色',
          freightTemplateId: '1',
          promotionFlag: false,
          promotionPrice: null,
          goodsName: '手机',
          sn: 'PHONE002',
          brandId: '1',
          categoryPath: '1/2/3',
          goodsUnit: '台',
          sellingPoint: '高性能手机',
          weight: 0.5,
          marketEnable: 'UPPER',
          intro: '<p>这是一款高性能手机</p>',
          price: 1999.00,
          cost: 1500.00,
          viewCount: 800,
          buyCount: 30,
          quantity: 150,
          grade: 100.0,
          thumbnail: '/images/phone-white-thumb.jpg',
          big: '/images/phone-white-big.jpg',
          small: '/images/phone-white-small.jpg',
          original: '/images/phone-white-original.jpg',
          storeCategoryPath: '1/2',
          commentNum: 8,
          storeId: '1',
          storeName: '手机旗舰店',
          templateId: '1',
          authFlag: 'PASS',
          authMessage: '',
          underMessage: '',
          selfOperated: true,
          mobileIntro: '<p>手机移动端详情</p>',
          goodsVideo: '',
          recommend: true,
          salesModel: 'NORMAL',
          goodsType: 'PHYSICAL_GOODS',
          alertQuantity: 10,
          specList: [
            {
              specName: '样式',
              specValue: '全网通',
              specType: 0,
              specImage: []
            },
            {
              specName: '颜色',
              specValue: '白色',
              specType: 1,
              specImage: ['/images/color-white.jpg']
            }
          ],
          goodsGalleryList: ['/images/phone-white1.jpg', '/images/phone-white2.jpg']
        }
      ],
      wholesaleList: []
    }
  ];

  getGoodsVO(goodsId: string) {
    const goods = this.goodsData.find(g => g.id === goodsId);
    if (!goods) {
      return null;
    }
    return goods;
  }

  getGoodsSkuDetail(goodsId: string, skuId: string) {
    const goods = this.goodsData.find(g => g.id === goodsId);
    if (!goods) {
      return null;
    }

    const sku = goods.skuList.find(s => s.id === skuId);
    if (!sku) {
      return null;
    }

    return {
      goodsId: sku.goodsId,
      skuId: sku.id,
      goodsName: sku.goodsName,
      price: sku.price,
      promotionPrice: sku.promotionPrice,
      specs: sku.specs,
      simpleSpecs: sku.simpleSpecs,
      goodsImage: sku.thumbnail,
      quantity: sku.quantity,
      weight: sku.weight,
      goodsGalleryList: sku.goodsGalleryList,
      specList: sku.specList
    };
  }

  getAllGoods() {
    return this.goodsData;
  }

  getAllSku() {
    const skuList = [];
    this.goodsData.forEach(goods => {
      goods.skuList.forEach(sku => {
        skuList.push(sku);
      });
    });
    return skuList;
  }
}
