import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {
  // 模拟商品分类数据
  private categories = [
    {
      id: '1',
      name: '手机数码',
      parentId: '0',
      level: 1,
      path: '1',
      children: [
        { id: '101', name: '手机', parentId: '1', level: 2, path: '1,101', children: [] },
        { id: '102', name: '电脑', parentId: '1', level: 2, path: '1,102', children: [] },
        { id: '103', name: '数码配件', parentId: '1', level: 2, path: '1,103', children: [] },
      ],
    },
    {
      id: '2',
      name: '家用电器',
      parentId: '0',
      level: 1,
      path: '2',
      children: [
        { id: '201', name: '冰箱', parentId: '2', level: 2, path: '2,201', children: [] },
        { id: '202', name: '洗衣机', parentId: '2', level: 2, path: '2,202', children: [] },
        { id: '203', name: '空调', parentId: '2', level: 2, path: '2,203', children: [] },
      ],
    },
    {
      id: '3',
      name: '服装鞋包',
      parentId: '0',
      level: 1,
      path: '3',
      children: [
        { id: '301', name: '男装', parentId: '3', level: 2, path: '3,301', children: [] },
        { id: '302', name: '女装', parentId: '3', level: 2, path: '3,302', children: [] },
        { id: '303', name: '鞋靴', parentId: '3', level: 2, path: '3,303', children: [] },
      ],
    },
  ];

  listAllChildren(parentId: string) {
    // 根据parentId获取所有子分类
    const result = this.categories.filter(category => category.parentId === parentId);
    return result;
  }
}
