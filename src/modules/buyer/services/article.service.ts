import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleService {
  // 模拟文章数据
  private articles = [
    {
      id: '1',
      title: '公司介绍',
      content: '这是公司介绍的内容...',
      createTime: new Date('2025-01-01'),
      categoryId: '1-1',
      type: 'about',
    },
    {
      id: '2',
      title: '联系我们',
      content: '这是联系我们的内容...',
      createTime: new Date('2025-01-02'),
      categoryId: '1-2',
      type: 'contact',
    },
    {
      id: '3',
      title: '购物流程',
      content: '这是购物流程的内容...',
      createTime: new Date('2025-01-03'),
      categoryId: '2-1',
      type: 'shopping',
    },
    {
      id: '4',
      title: '支付方式',
      content: '这是支付方式的内容...',
      createTime: new Date('2025-01-04'),
      categoryId: '2-2',
      type: 'payment',
    },
    {
      id: '5',
      title: '退换货政策',
      content: '这是退换货政策的内容...',
      createTime: new Date('2025-01-05'),
      categoryId: '3-1',
      type: 'refund',
    },
    {
      id: '6',
      title: '常见问题',
      content: '这是常见问题的内容...',
      createTime: new Date('2025-01-06'),
      categoryId: '3-2',
      type: 'faq',
    },
  ];

  // 分页获取文章列表
  articlePage(articleSearchParams: any) {
    const { page = 1, limit = 10, categoryId } = articleSearchParams;
    let filteredArticles = this.articles;

    if (categoryId) {
      filteredArticles = filteredArticles.filter(article => article.categoryId === categoryId);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return {
      records: paginatedArticles,
      total: filteredArticles.length,
      size: limit,
      current: page,
      orders: [],
      optimizeCountSql: true,
      hitCount: false,
      countId: null,
      maxLimit: null,
      searchCount: true,
      pages: Math.ceil(filteredArticles.length / limit),
    };
  }

  // 通过ID获取文章
  customGet(id: string) {
    return this.articles.find(article => article.id === id);
  }

  // 通过类型获取文章
  customGetByType(type: string) {
    return this.articles.find(article => article.type === type);
  }
}
