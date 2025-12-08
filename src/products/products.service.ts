import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
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
      sortOrder: createProductDto.sortOrder || 0,
    });
    return await this.productRepository.save(product);
  }

  /**
   * 查询商品列表
   */
  async findAll(params?: any): Promise<{ data: Product[], total: number }> {
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
    
    // 排序
    queryBuilder.orderBy('product.sortOrder', 'ASC');
    queryBuilder.addOrderBy('product.createTime', 'DESC');
    
    // 分页
    const total = await queryBuilder.getCount();
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      queryBuilder.offset(offset).limit(params.limit);
    }
    
    const data = await queryBuilder.getMany();
    
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
    const product = await this.findOne(id);
    
    // 创建更新对象，处理布尔值到数字的转换
    const updateData: any = { ...updateProductDto };
    
    if (updateProductDto.isShow !== undefined) {
      updateData.isShow = updateProductDto.isShow ? 1 : 0;
      delete updateData.isShow; // 从 DTO 中删除，避免类型错误
    }
    
    if (updateProductDto.isNew !== undefined) {
      updateData.isNew = updateProductDto.isNew ? 1 : 0;
      delete updateData.isNew; // 从 DTO 中删除，避免类型错误
    }
    
    if (updateProductDto.isHot !== undefined) {
      updateData.isHot = updateProductDto.isHot ? 1 : 0;
      delete updateData.isHot; // 从 DTO 中删除，避免类型错误
    }
    
    // 先将基本属性合并到 product 对象
    Object.assign(product, updateProductDto);
    
    // 再将转换后的数字值赋值给对应的属性
    if (updateData.isShow !== undefined) product.isShow = updateData.isShow;
    if (updateData.isNew !== undefined) product.isNew = updateData.isNew;
    if (updateData.isHot !== undefined) product.isHot = updateData.isHot;
    
    return await this.productRepository.save(product);
  }

  /**
   * 删除商品
   */
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('商品不存在');
    }
    return { message: '删除成功' };
  }

  /**
   * 批量删除商品
   */
  async removeBatch(ids: string[]): Promise<{ message: string; affected: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('请选择要删除的商品');
    }
    
    const result = await this.productRepository.delete(ids);
    
    return {
      message: `成功删除${result.affected || 0}个商品`,
      affected: result.affected || 0,
    };
  }

  /**
   * 更新商品状态（上架/下架）
   */
  async updateStatus(id: string, isShow: boolean): Promise<Product> {
    const product = await this.findOne(id);
    product.isShow = isShow ? 1 : 0;
    return await this.productRepository.save(product);
  }
}
