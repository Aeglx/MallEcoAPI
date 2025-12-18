import { Injectable } from '@nestjs/common';

@Injectable()
export class OtherService {
  
  // 获取首页楼层装修数据
  async getIndexData(params: any) {
    // 模拟首页装修数据
    const pageData = {
      list: [
        {
          type: 'goodsCategory',
          options: {
            categories: [
              { id: 1, name: '手机数码', image: '/images/category1.jpg' },
              { id: 2, name: '电脑办公', image: '/images/category2.jpg' }
            ]
          }
        },
        {
          type: 'seckill',
          options: {
            list: [] // 秒杀数据由前端单独调用
          }
        }
      ]
    };

    return {
      success: true,
      result: {
        pageData: JSON.stringify(pageData)
      },
      message: '获取首页数据成功'
    };
  }

  // 获取专题页面数据
  async getTopicData(id: string) {
    return {
      success: true,
      result: {
        title: '专题页面',
        content: '专题页面内容',
        images: ['/images/topic1.jpg', '/images/topic2.jpg']
      },
      message: '获取专题数据成功'
    };
  }

  // 获取页面数据
  async getPageData(params: any) {
    return {
      success: true,
      result: {
        pageData: JSON.stringify({
          list: [
            {
              type: 'store',
              options: {
                storeInfo: {
                  name: '示例店铺',
                  logo: '/images/store-logo.jpg'
                }
              }
            }
          ]
        })
      },
      message: '获取页面数据成功'
    };
  }

  // 分页获取文章列表
  async getArticleList(params: any) {
    return {
      success: true,
      result: {
        records: [
          {
            id: 1,
            title: '帮助中心文章1',
            content: '文章内容1',
            categoryId: 1
          },
          {
            id: 2,
            title: '帮助中心文章2', 
            content: '文章内容2',
            categoryId: 1
          }
        ],
        total: 2
      },
      message: '获取文章列表成功'
    };
  }

  // 获取文章详情
  async getArticleDetail(id: string) {
    return {
      success: true,
      result: {
        id: parseInt(id),
        title: '文章标题',
        content: '文章详细内容',
        categoryId: 1,
        createTime: new Date().toISOString()
      },
      message: '获取文章详情成功'
    };
  }

  // 获取文章分类列表
  async getArticleCategoryList() {
    return {
      success: true,
      result: [
        {
          id: 1,
          name: '帮助中心',
          sort: 1
        },
        {
          id: 2,
          name: '常见问题',
          sort: 2
        }
      ],
      message: '获取文章分类成功'
    };
  }
}