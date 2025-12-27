import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleCategoryService {
  // 模拟文章分类数据
  private articleCategories = [
    {
      id: '1',
      name: '关于我们',
      children: [
        { id: '1-1', name: '公司介绍' },
        { id: '1-2', name: '联系我们' },
      ],
    },
    {
      id: '2',
      name: '购物指南',
      children: [
        { id: '2-1', name: '购物流程' },
        { id: '2-2', name: '支付方式' },
      ],
    },
    {
      id: '3',
      name: '售后服务',
      children: [
        { id: '3-1', name: '退换货政策' },
        { id: '3-2', name: '常见问题' },
      ],
    },
  ];

  allChildren() {
    return this.articleCategories;
  }
}
