import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private readonly products = [
    {
      id: '1',
      name: '智能手机',
      price: 2999,
      description: '高性能智能手机',
      stock: 100,
      sales: 50,
      mainImage: 'https://example.com/smartphone.jpg',
      categoryId: '1',
      brandId: '1',
      isShow: 1,
      isNew: 1,
      isHot: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: '笔记本电脑',
      price: 4999,
      description: '轻薄便携笔记本',
      stock: 50,
      sales: 20,
      mainImage: 'https://example.com/laptop.jpg',
      categoryId: '2',
      brandId: '2',
      isShow: 1,
      isNew: 0,
      isHot: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: '无线耳机',
      price: 799,
      description: '降噪无线耳机',
      stock: 200,
      sales: 100,
      mainImage: 'https://example.com/headphones.jpg',
      categoryId: '3',
      brandId: '1',
      isShow: 1,
      isNew: 1,
      isHot: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll() {
    return this.products;
  }

  findOne(id: string) {
    return this.products.find((product) => product.id === id);
  }
}
