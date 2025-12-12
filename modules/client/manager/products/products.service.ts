import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../common/product/entities/product.entity';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';
import { RabbitMQService } from '../../../src/rabbitmq/rabbitmq.service';

@Injectable()
export class ManagerProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.created', product);
    return product;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ 
      where: { id },
      relations: ['category', 'brand', 'skus']
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
    await this.rabbitMQService.emit('product.deleted', { id });
  }

  async getProducts(query: QueryProductDto): Promise<{ data: Product[]; total: number }> {
    const { page = 1, limit = 10, name, status, categoryId, brandId, isRecommended, isHot } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (status) {
      const isShow = status === 'published' ? 1 : 0;
      queryBuilder.andWhere('product.isShow = :isShow', { isShow });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId });
    }

    if (isRecommended !== undefined) {
      queryBuilder.andWhere('product.isRecommend = :isRecommended', { 
        isRecommended: isRecommended ? 1 : 0 
      });
    }

    if (isHot !== undefined) {
      queryBuilder.andWhere('product.isHot = :isHot', { 
        isHot: isHot ? 1 : 0 
      });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async publishProduct(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.isShow = 1; // 1表示上架
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }

  async unpublishProduct(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.isShow = 0; // 0表示下架
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }

  async setRecommend(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.isRecommend = 1; // 1表示推荐
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }

  async unsetRecommend(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.isRecommend = 0; // 0表示不推荐
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }

  async setHot(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.isHot = 1; // 1表示热门
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }

  async removeHot(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.isHot = 0; // 0表示不热门
    await this.productRepository.save(product);
    await this.rabbitMQService.emit('product.updated', product);
    return product;
  }
}
