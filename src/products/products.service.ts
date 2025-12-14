import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RabbitMQService } from '../infrastructure/rabbitmq/rabbitmq.service';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}







  /**
   * 创建商品
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      sales: 0, // 初始销量为0
      isShow: createProductDto.isShow ? 1 : 0,
      isNew: createProductDto.isNew ? 1 : 0,
      isHot: createProductDto.isHot ? 1 : 0,
      recommend: createProductDto.recommend ? 1 : 0,
      sortOrder: createProductDto.sortOrder || 0,
    });
    await this.productRepository.save(product);

    // 发送商品创建消�?
    await this.rabbitMQService.emit('product.created', product);

    // 发送商品更新消�?
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 查询商品列表
   */
  async findAll(params?: {
    name?: string;
    categoryId?: string;
    brandId?: string;
    isShow?: number;
    isNew?: number;
    isHot?: number;
    recommend?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[], total: number }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // 条件查询
    if (params.name) {
      queryBuilder.where('product.name LIKE :name', { name: `%${params.name}%` });
    }
    
    if (params.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: params.categoryId });
    }
    
    if (params.brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId: params.brandId });
    }
    
    if (params.isShow !== undefined) {
      queryBuilder.andWhere('product.isShow = :isShow', { isShow: params.isShow });
    }
    
    if (params.isNew !== undefined) {
      queryBuilder.andWhere('product.isNew = :isNew', { isNew: params.isNew });
    }
    
    if (params.isHot !== undefined) {
      queryBuilder.andWhere('product.isHot = :isHot', { isHot: params.isHot });
    }
    
    if (params.recommend !== undefined) {
      queryBuilder.andWhere('product.recommend = :recommend', { recommend: params.recommend });
    }
    
    // 排序
    queryBuilder.orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.createdAt', 'DESC');
    
    // 分页
    const total = await queryBuilder.getCount();
    let data: Product[] = [];
    
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      data = await queryBuilder.skip(offset).take(params.limit).getMany();
    } else {
      data = await queryBuilder.getMany();
    }
    
    return { data, total };
  }

  /**
   * 查询单个商品
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }

  /**
   * 更新商品
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    
    // 创建更新对象，处理布尔值到数字的转换
    const updateData: Partial<Product> = { ...updateProductDto };
    
    if (updateProductDto.isShow !== undefined) {
      updateData.isShow = updateProductDto.isShow ? 1 : 0;
    }
    
    if (updateProductDto.isNew !== undefined) {
      updateData.isNew = updateProductDto.isNew ? 1 : 0;
    }
    
    if (updateProductDto.isHot !== undefined) {
      updateData.isHot = updateProductDto.isHot ? 1 : 0;
    }
    
    if (updateProductDto.recommend !== undefined) {
      updateData.recommend = updateProductDto.recommend ? 1 : 0;
    }
    
    // 更新商品
    await this.productRepository.update(id, updateData);
    const updatedProduct = await this.productRepository.findOne({ where: { id } });

    // 发送商品更新消�?
    await this.rabbitMQService.emit('product.updated', updatedProduct);

    return updatedProduct;
  }

  /**
   * 删除商品
   */
  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    
    await this.productRepository.delete(id);

    // 发送商品删除消息
    await this.rabbitMQService.emit('product.deleted', { id });

    return { message: '删除成功' };
  }

  /**
   * 批量删除商品
   */
  async removeBatch(ids: string[]): Promise<{ message: string; affected: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('请选择要删除的商品');
    }
    
    // 过滤掉不存在的商�?
    const existingProducts = await this.productRepository.find({
      where: ids.map(id => ({ id }))
    });
    
    const validIds = existingProducts.map(product => product.id);
    
    // 删除商品
    await this.productRepository.delete(validIds);
    
    const affected = validIds.length;
    
    // 发送商品批量删除消�?
    await this.rabbitMQService.emit('product.batch.deleted', { ids });

    return {
      message: `成功删除${affected}个商品`,
      affected,
    };
  }

  /**
   * 更新商品状态（上架/下架）
   */
  async updateStatus(id: string, isShow: boolean): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    
    product.isShow = isShow ? 1 : 0;
    await this.productRepository.save(product);

    // 发送商品状态更新消息
    await this.rabbitMQService.emit('product.status.updated', {
      id: product.id,
      isShow: product.isShow,
    });

    return product;
  }

  /**
   * 商品搜索
   */
  async search(params: {
    keyword?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    isShow?: number;
    isNew?: number;
    isHot?: number;
    recommend?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ data: Product[], total: number }> {
    // 暂时使用TypeORM进行简单搜索，后续可替换为Elasticsearch
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    const { keyword, categoryId, brandId, minPrice, maxPrice, isShow, isNew, isHot, recommend, page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'ASC' } = params;

    // 关键词搜�?
    if (keyword) {
      queryBuilder.where('product.name LIKE :keyword OR product.description LIKE :keyword', { keyword: `%${keyword}%` });
    }

    // 分类过滤
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // 品牌过滤
    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId });
    }

    // 价格范围过滤
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // 上架状态过�?
    if (isShow !== undefined) {
      queryBuilder.andWhere('product.isShow = :isShow', { isShow });
    }

    // 新品过滤
    if (isNew !== undefined) {
      queryBuilder.andWhere('product.isNew = :isNew', { isNew });
    }

    // 热门过滤
    if (isHot !== undefined) {
      queryBuilder.andWhere('product.isHot = :isHot', { isHot });
    }

    // 推荐过滤
    if (recommend !== undefined) {
      queryBuilder.andWhere('product.recommend = :recommend', { recommend });
    }

    // 默认过滤上架商品
    if (!isShow && isShow !== 0) {
      queryBuilder.andWhere('product.isShow = 1');
    }

    // 排序
    // 支持的排序字段：price, sales, createdAt, sortOrder
    const validSortFields = ['price', 'sales', 'createdAt', 'sortOrder'];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'sortOrder';
    const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    queryBuilder.orderBy(`product.${actualSortField}`, actualSortOrder);
    
    // 如果不是按创建时间排序，添加创建时间作为次要排序条件
    if (actualSortField !== 'createdAt') {
      queryBuilder.addOrderBy('product.createdAt', 'DESC');
    }

    // 分页
    const [data, total] = await queryBuilder.skip((page - 1) * limit).take(limit).getManyAndCount();

    return {
      data,
      total,
    };
  }

  /**
   * 根据关键词获取商品（用于搜索联想�?
   * @param keyword 搜索关键�?
   * @param limit 获取数量
   * @returns 商品列表
   */
  async getProductsByKeyword(keyword: string, limit: number = 10) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :keyword', { keyword: `${keyword}%` })
      .andWhere('product.isShow = :isShow', { isShow: 1 })
      .orderBy('product.sales', 'DESC')
      .limit(limit)
      .getMany();

    return products;
  }

  /**
   * 获取推荐商品
   */
  async getRecommendedProducts(params?: any): Promise<{ data: Product[], total: number }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // 只获取推荐商�?
    queryBuilder.where('product.recommend = 1');
    
    // 只获取上架商�?
    queryBuilder.andWhere('product.isShow = 1');
    
    // 可选的分类过滤
    if (params.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: params.categoryId });
    }
    
    // 可选的品牌过滤
    if (params.brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId: params.brandId });
    }
    
    // 排序：先按排序字段，再按创建时间
    queryBuilder.orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.createdAt', 'DESC');
    
    // 分页
    const total = await queryBuilder.getCount();
    let data: Product[] = [];
    
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      data = await queryBuilder.skip(offset).take(params.limit).getMany();
    } else {
      data = await queryBuilder.getMany();
    }
    
    return {
      data,
      total,
    };
  }
}

