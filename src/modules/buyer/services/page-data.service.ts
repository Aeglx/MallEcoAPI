import { Injectable } from '@nestjs/common';

@Injectable()
export class PageDataService {
  getIndexData(clientType: string) {
    // 返回模拟的首页装修数据，完全匹配Java版本
    return {
      success: true,
      result: {
        pageData: {
          list: [
            {
              key: 'carousel1',
              type: 'carousel1',
              options: {
                list: [
                  {
                    id: 1,
                    imageUrl: 'https://dummyimage.com/1200x400/cccccc/ffffff&text=新潮国货-为颜值加分',
                    linkUrl: '/',
                    title: '首页横幅1'
                  }
                ]
              }
            },
            {
              key: 'newGoodsSort',
              type: 'newGoodsSort',
              options: {
                left: {
                  bgColor: '#c43d7e',
                  title: '新品首发',
                  secondTitle: '更多新品',
                  url: '/new-goods',
                  list: [
                    {
                      name: '苹果 iPhone 15',
                      describe: '全新A17 Pro芯片，钛金属机身',
                      img: 'https://dummyimage.com/90x90/cccccc/ffffff&text=iPhone15',
                      url: '/goods/1'
                    },
                    {
                      name: '华为 Mate 60',
                      describe: '麒麟9000S芯片，卫星通信',
                      img: 'https://dummyimage.com/90x90?text=Mate60',
                      url: '/goods/2'
                    },
                    {
                      name: '小米 14',
                      describe: '骁龙8 Gen3，徕卡影像',
                      img: 'https://dummyimage.com/90x90?text=小米14',
                      url: '/goods/3'
                    },
                    {
                      name: 'OPPO Find X7',
                      describe: '哈苏影像，潜望式长焦',
                      img: 'https://dummyimage.com/90x90?text=FindX7',
                      url: '/goods/4'
                    }
                  ]
                },
                middle: {
                  bgColor: '#e64340',
                  title: '逛好店',
                  secondTitle: '更多店铺',
                  url: '/stores',
                  list: [
                    {
                      name: 'Apple官方旗舰店',
                      describe: '官方正品，假一赔十',
                      img: 'https://dummyimage.com/90x90?text=Apple店',
                      url: '/store/1'
                    },
                    {
                      name: '华为官方旗舰店',
                      describe: '华为全系列产品',
                      img: 'https://dummyimage.com/90x90?text=华为店',
                      url: '/store/2'
                    },
                    {
                      name: '小米官方旗舰店',
                      describe: '小米生态链产品',
                      img: 'https://dummyimage.com/90x90?text=小米店',
                      url: '/store/3'
                    },
                    {
                      name: 'OPPO官方旗舰店',
                      describe: 'OPPO全系列产品',
                      img: 'https://dummyimage.com/90x90?text=OPPO店',
                      url: '/store/4'
                    }
                  ]
                },
                right: {
                  bgColor: '#722ed1',
                  title: '威化饼干',
                  secondTitle: '更多零食',
                  url: '/snacks',
                  list: [
                    {
                      name: '奥利奥威化饼干',
                      price: 19.9,
                      img: 'https://dummyimage.com/100x100?text=奥利奥',
                      url: '/goods/10'
                    },
                    {
                      name: '雀巢威化饼干',
                      price: 29.9,
                      img: 'https://dummyimage.com/100x100?text=雀巢',
                      url: '/goods/11'
                    },
                    {
                      name: '徐福记威化饼干',
                      price: 39.9,
                      img: 'https://dummyimage.com/100x100?text=徐福记',
                      url: '/goods/12'
                    },
                    {
                      name: '嘉士利威化饼干',
                      price: 49.9,
                      img: 'https://dummyimage.com/100x100?text=嘉士利',
                      url: '/goods/13'
                    },
                    {
                      name: '康师傅威化饼干',
                      price: 59.9,
                      img: 'https://dummyimage.com/100x100?text=康师傅',
                      url: '/goods/14'
                    },
                    {
                      name: '达利园威化饼干',
                      price: 69.9,
                      img: 'https://dummyimage.com/100x100?text=达利园',
                      url: '/goods/15'
                    }
                  ]
                }
              }
            },
            {
              key: 'oneRowThreeColumns',
              type: 'oneRowThreeColumns',
              options: {
                list: [
                  {
                    img: 'https://dummyimage.com/385x165?text=数码手机',
                    url: '/category/1'
                  },
                  {
                    img: 'https://dummyimage.com/385x165?text=品牌闪购',
                    url: '/flash-sale'
                  },
                  {
                    img: 'https://dummyimage.com/385x165?text=23春夏焕新折',
                    url: '/spring-sale'
                  }
                ]
              }
            },
            {
              key: 'forYour',
              type: 'forYour',
              options: {
                title: '为你推荐',
                data: {
                  image: {
                    src: 'https://dummyimage.com/346x554?text=为你推荐'
                  },
                  list: [
                    {
                      title: '米家空气净化器',
                      desc: '高效净化，智能控制',
                      img: 'https://dummyimage.com/190x156?text=空气净化器',
                      url: '/goods/20'
                    },
                    {
                      title: 'MAC魅可口红',
                      desc: '经典色号，持久不脱色',
                      img: 'https://dummyimage.com/190x156?text=MAC口红',
                      url: '/goods/21'
                    },
                    {
                      title: 'Gucci香水',
                      desc: '奢华香氛，持久留香',
                      img: 'https://dummyimage.com/190x156?text=Gucci香水',
                      url: '/goods/22'
                    },
                    {
                      title: 'Adidas运动鞋',
                      desc: '舒适透气，时尚百搭',
                      img: 'https://dummyimage.com/190x156?text=Adidas鞋',
                      url: '/goods/23'
                    }
                  ],
                  hot: {
                    title: '热卖推荐',
                    list: [
                      {
                        title: 'iPhone 15 Pro',
                        price: 9999,
                        img: 'https://dummyimage.com/76x78?text=iPhone15Pro',
                        url: '/goods/30'
                      },
                      {
                        title: '华为 Mate 60 Pro',
                        price: 8999,
                        img: 'https://dummyimage.com/76x78?text=Mate60Pro',
                        url: '/goods/31'
                      },
                      {
                        title: '小米 14 Pro',
                        price: 4999,
                        img: 'https://dummyimage.com/76x78?text=小米14Pro',
                        url: '/goods/32'
                      },
                      {
                        title: 'OPPO Find X7 Pro',
                        price: 5999,
                        img: 'https://dummyimage.com/76x78?text=FindX7Pro',
                        url: '/goods/33'
                      }
                    ]
                  }
                }
              }
            },
            {
              key: 'superBrandDay',
              type: 'mixModel',
              options: {
                left: {
                  model: 'goods',
                  data: {
                    image: {
                      src: 'https://dummyimage.com/196x343?text=超级品牌日-左侧',
                      url: '/super-brand-day'
                    },
                    badge: {
                      label: '超级品牌日'
                    },
                    list: [
                      {
                        title: 'S8 Ultra 智能手表',
                        price: 2999,
                        img: 'https://dummyimage.com/90x90?text=智能手表',
                        url: '/goods/40'
                      },
                      {
                        title: '3.8女神特惠 服饰精选',
                        price: 199,
                        img: 'https://dummyimage.com/90x90?text=服饰特惠',
                        url: '/sale/38'
                      },
                      {
                        title: '小米无线耳机',
                        price: 499,
                        img: 'https://dummyimage.com/90x90?text=无线耳机',
                        url: '/goods/41'
                      },
                      {
                        title: '华为MatePad Pro',
                        price: 5999,
                        img: 'https://dummyimage.com/90x90?text=MatePad',
                        url: '/goods/42'
                      }
                    ]
                  }
                },
                right: {
                  model: 'brand',
                  data: {
                    image: {
                      src: 'https://dummyimage.com/254x344?text=品牌专区',
                      url: '/brands'
                    },
                    list: [
                      {
                        img: 'https://dummyimage.com/90x90?text=Apple',
                        url: '/brand/apple'
                      },
                      {
                        img: 'https://dummyimage.com/90x90?text=华为',
                        url: '/brand/huawei'
                      },
                      {
                        img: 'https://dummyimage.com/90x90?text=小米',
                        url: '/brand/xiaomi'
                      },
                      {
                        img: 'https://dummyimage.com/90x90?text=OPPO',
                        url: '/brand/oppo'
                      }
                    ]
                  }
                }
              }
            },
            {
              key: 'loginBanner',
              type: 'bannerAdvert',
              options: {
                img: 'https://dummyimage.com/1183x167?text=会员登陆',
                url: '/login'
              }
            }
          ]
        }
      }
    };
  }

  getSpecial(id: string) {
    // 返回模拟的专题页面数据
    return {
      success: true,
      result: {
        pageData: {
          list: [
            {
              type: 'carousel1',
              options: {
                list: [
                  {
                    id: 1,
                    imageUrl: 'https://dummyimage.com/1200x400?text=Special+Banner',
                    linkUrl: '/',
                    title: '专题横幅'
                  }
                ]
              }
            },
            {
              type: 'goodsList',
              options: {
                title: '专题商品',
                list: [
                  {
                    id: 1,
                    name: '专题商品1',
                    price: 199,
                    image: 'https://dummyimage.com/200x200?text=商品1',
                    specs: [
                      { name: '样式', value: '全网通' },
                      { name: '颜色', value: '黑色' }
                    ]
                  },
                  {
                    id: 2,
                    name: '专题商品2',
                    price: 299,
                    image: 'https://dummyimage.com/200x200?text=商品2',
                    specs: [
                      { name: '样式', value: '移动版' },
                      { name: '颜色', value: '白色' }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    };
  }

  getPageData(pageDataDTO: any) {
    // 根据pageDataDTO参数返回对应的页面数据
    // 这里简单实现，根据pageType返回不同的数据
    const { pageType, pageClientType, num } = pageDataDTO;
    
    if (pageType === 'INDEX') {
      return this.getIndexData(pageClientType);
    } else if (pageType === 'STORE') {
      return this.getStorePage(pageClientType, num);
    } else {
      // 默认返回首页数据
      return this.getIndexData(pageClientType || 'PC');
    }
  }

  getStorePage(clientType: string, storeId: string) {
    // 返回模拟的店铺首页数据
    return {
      success: true,
      result: {
        pageData: {
          list: [
            {
              type: 'storeHeader',
              options: {
                storeId: storeId,
                storeName: '测试店铺',
                storeLogo: 'https://dummyimage.com/100x100?text=Store+Logo',
                storeDesc: '这是一家测试店铺，提供优质商品和服务',
                followCount: 1234,
                goodsCount: 567
              }
            },
            {
              type: 'storeCategory',
              options: {
                list: [
                  { id: 1, name: '店铺分类1' },
                  { id: 2, name: '店铺分类2' },
                  { id: 3, name: '店铺分类3' }
                ]
              }
            },
            {
              type: 'goodsList',
              options: {
                title: '店铺热卖',
                list: [
                  {
                    id: 1,
                    name: '店铺商品1',
                    price: 199,
                    image: 'https://dummyimage.com/200x200?text=店铺商品1',
                    specs: [
                      { name: '样式', value: '标准款' },
                      { name: '颜色', value: '红色' }
                    ]
                  },
                  {
                    id: 2,
                    name: '店铺商品2',
                    price: 299,
                    image: 'https://dummyimage.com/200x200?text=店铺商品2',
                    specs: [
                      { name: '样式', value: '升级版' },
                      { name: '颜色', value: '蓝色' }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    };
  }

  getSpecialByBody(body: string) {
    // 从body中提取专题名称，然后返回对应的专题页面数据
    let name = '';
    if (body.indexOf('』') >= 0 && body.indexOf('『') >= 0) {
      name = body.substring(body.indexOf('『') + 1, body.lastIndexOf('』'));
    } else if (body.indexOf('〉') >= 0 && body.indexOf('〈') >= 0) {
      name = body.substring(body.indexOf('〈') + 1, body.lastIndexOf('〉'));
    } else if (body.indexOf('」') >= 0 && body.indexOf('「') >= 0) {
      name = body.substring(body.indexOf('「') + 1, body.lastIndexOf('」'));
    } else if (body.indexOf('》') >= 0 && body.indexOf('《') >= 0) {
      name = body.substring(body.indexOf('《') + 1, body.lastIndexOf('》'));
    } else if (body.indexOf('）') >= 0 && body.indexOf('（') >= 0) {
      name = body.substring(body.indexOf('（') + 1, body.lastIndexOf('）'));
    } else if (body.indexOf('】') >= 0 && body.indexOf('【') >= 0) {
      name = body.substring(body.indexOf('【') + 1, body.lastIndexOf('】'));
    } else if (body.indexOf('｝') >= 0 && body.indexOf('｛') >= 0) {
      name = body.substring(body.indexOf('｛') + 1, body.lastIndexOf('｝'));
    } else if (body.indexOf('！') >= 0) {
      name = body.substring(body.indexOf('！') + 1, body.lastIndexOf('！'));
    } else if (body.indexOf('｜') >= 0) {
      name = body.substring(body.indexOf('｜') + 1, body.lastIndexOf('｜'));
    }
    
    // 返回模拟的专题页面数据，使用提取的name作为专题名称
    return {
      success: true,
      result: {
        pageData: {
          list: [
            {
              type: 'carousel1',
              options: {
                list: [
                  {
                    id: 1,
                    imageUrl: `https://dummyimage.com/1200x400?text=${encodeURIComponent(name)}+Banner`,
                    linkUrl: '/',
                    title: `${name}专题横幅`
                  }
                ]
              }
            },
            {
              type: 'goodsList',
              options: {
                title: `${name}专题商品`,
                list: [
                  {
                    id: 1,
                    name: `${name}商品1`,
                    price: 199,
                    image: `https://dummyimage.com/200x200?text=${encodeURIComponent(name)}商品1`,
                    specs: [
                      { name: '样式', value: '标准款' },
                      { name: '颜色', value: '黑色' }
                    ]
                  },
                  {
                    id: 2,
                    name: `${name}商品2`,
                    price: 299,
                    image: `https://dummyimage.com/200x200?text=${encodeURIComponent(name)}商品2`,
                    specs: [
                      { name: '样式', value: '升级版' },
                      { name: '颜色', value: '白色' }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    };
  }
}