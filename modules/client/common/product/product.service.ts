import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 创建商品
   * @param createProductDto 商品创建DTO
   * @returns 创建的商品
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * 获取所有商品列表
   * @returns 商品列表
   */
  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['category', 'brand', 'skus'],
    });
  }

  /**
   * 根据ID获取商品详情
   * @param id 商品ID
   * @returns 商品详情
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand', 'skus'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * 更新商品信息
   * @param id 商品ID
   * @param updateProductDto 商品更新DTO
   * @returns 更新后的商品
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const updatedProduct = this.productRepository.merge(product, updateProductDto);
    return await this.productRepository.save(updatedProduct);
  }

  /**
   * 删除商品
   * @param id 商品ID
   * @returns 删除结果
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  /**
   * 分页获取商品列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页商品列表
   */
  async findByPage(page: number, limit: number): Promise<{ items: Product[]; total: number }> {
    const [items, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['category', 'brand'],
    });
    return { items, total };
  }

  /**
   * 根据分类ID获取商品列表
   * @param categoryId 分类ID
   * @returns 商品列表
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { categoryId },
      relations: ['category', 'brand'],
    });
  }

  /**
   * 根据品牌ID获取商品列表
   * @param brandId 品牌ID
   * @returns 商品列表
   */
  async findByBrand(brandId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { brandId },
      relations: ['category', 'brand'],
    });
  }

  /**
   * 根据店铺ID统计商品数量
   * @param storeId 店铺ID
   * @returns 商品数量
   */
  async countByStoreId(storeId: string): Promise<number> {
    return await this.productRepository.count({
      where: { storeId },
    });
  }
}
