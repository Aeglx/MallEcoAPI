import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../common/product/entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取商品列表（支持分页、分类、品牌、关键词搜索和排序）
   * @param page 页码
   * @param limit 每页数量
   * @param categoryId 分类ID
   * @param brandId 品牌ID
   * @param keyword 搜索关键字
   * @param sortBy 排序字段
   * @param sortOrder 排序顺序
   * @returns 分页商品列表
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    brandId?: string,
    keyword?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ items: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.skus', 'sku');

    // 添加过滤条件
    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (brandId) {
      query.andWhere('product.brandId = :brandId', { brandId });
    }
    if (keyword) {
      query.andWhere('product.name LIKE :keyword OR product.description LIKE :keyword', { 
        keyword: `%${keyword}%`,
      });
    }

    // 添加排序
    if (sortBy) {
      query.orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('product.createTime', 'DESC');
    }

    // 执行分页查询
    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取商品详情
   * @param id 商品ID
   * @returns 商品详情
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id } as any,
      relations: ['category', 'brand', 'skus'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * 根据分类ID获取商品列表
   * @param categoryId 分类ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页商品列表
   */
  async findByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Product[]; total: number }> {
    return this.findAll(page, limit, categoryId);
  }

  /**
   * 根据品牌ID获取商品列表
   * @param brandId 品牌ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页商品列表
   */
  async findByBrand(
    brandId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Product[]; total: number }> {
    return this.findAll(page, limit, undefined, brandId);
  }

  /**
   * 搜索商品
   * @param keyword 搜索关键�?
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页商品列表
   */
  async search(
    keyword: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Product[]; total: number }> {
    return this.findAll(page, limit, undefined, undefined, keyword);
  }
}

