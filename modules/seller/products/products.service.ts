import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder } from 'typeorm';
import { Product } from '../../common/product/entities/product.entity';
import { ProductSku } from '../../common/product/entities/product-sku.entity';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';
import { RabbitMQService } from '../../../src/rabbitmq/rabbitmq.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSku) private readonly productSkuRepository: Repository<ProductSku>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  /**
   * 创建商品
   */
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      sales: 0,
      isShow: 0, // 默认下架状态
      isNew: 0,
      isHot: 0,
      isRecommend: 0,
      createTime: new Date(),
      updateTime: new Date(),
      isDel: 0,
    });

    await this.productRepository.save(product);

    // 发送商品创建事件
    await this.rabbitMQService.emit('product.created', product);

    return product;
  }

  /**
   * 获取商品详情
   */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isDel: 0 },
      relations: ['skus'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  /**
   * 更新商品
   */
  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.getProductById(id);

    await this.productRepository.save({
      ...product,
      ...updateProductDto,
      updateTime: new Date(),
    });

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 删除商品（软删除）
   */
  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);

    product.isDel = 1;
    await this.productRepository.save(product);

    // 发送商品删除事件
    await this.rabbitMQService.emit('product.deleted', { id });
  }

  /**
   * 上架商品
   */
  async publishProduct(id: string): Promise<Product> {
    const product = await this.getProductById(id);

    product.isShow = 1;
    await this.productRepository.save(product);

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 下架商品
   */
  async unpublishProduct(id: string): Promise<Product> {
    const product = await this.getProductById(id);

    product.isShow = 0;
    await this.productRepository.save(product);

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 设置商品为新品
   */
  async setNew(id: string): Promise<Product> {
    const product = await this.getProductById(id);

    product.isNew = 1;
    await this.productRepository.save(product);

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 取消商品新品标记
   */
  async unsetNew(id: string): Promise<Product> {
    const product = await this.getProductById(id);

    product.isNew = 0;
    await this.productRepository.save(product);

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 设置商品为热门
   */
  async setHot(id: string): Promise<Product> {
    const product = await this.getProductById(id);

    product.isHot = 1;
    await this.productRepository.save(product);

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 取消商品热门标记
   */
  async unsetHot(id: string): Promise<Product> {
    const product = await this.getProductById(id);

    product.isHot = 0;
    await this.productRepository.save(product);

    // 发送商品更新事件
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 获取商品列表
   */
  async getProducts(queryDto: QueryProductDto): Promise<{ list: Product[]; total: number }> {
    const { page = 1, pageSize = 10, name, categoryId, isShow } = queryDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.isDel = :isDel', { isDel: 0 });

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (isShow !== undefined) {
      queryBuilder.andWhere('product.isShow = :isShow', { isShow });
    }

    queryBuilder.orderBy('product.createTime', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total };
  }
}
