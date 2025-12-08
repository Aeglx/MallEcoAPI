import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class ProductsService {
  // 使用内存数据结构模拟数据库
  private products: any[] = [];
  private nextId = 1;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  // 模拟数据库操作
  private findProductIndex(id: number): number {
    return this.products.findIndex(product => product.id === id);
  }





  /**
   * 创建商品
   */
  async create(createProductDto: CreateProductDto): Promise<any> {
    const product = {
      id: this.nextId++,
      ...createProductDto,
      sales: 0, // 初始销量为0
      isShow: createProductDto.isShow ? 1 : 0,
      isNew: createProductDto.isNew ? 1 : 0,
      isHot: createProductDto.isHot ? 1 : 0,
      sortOrder: createProductDto.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);

    // 发送商品创建消息
    await this.rabbitMQService.emit('product.created', product);

    // 发送商品更新消息
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 查询商品列表
   */
  async findAll(params?: any): Promise<{ data: any[], total: number }> {
    let filteredProducts = [...this.products];
    
    // 条件查询
    if (params.name) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.includes(params.name)
      );
    }
    
    if (params.categoryId) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === params.categoryId
      );
    }
    
    if (params.brandId) {
      filteredProducts = filteredProducts.filter(product => 
        product.brandId === params.brandId
      );
    }
    
    if (params.isShow !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.isShow === params.isShow
      );
    }
    
    if (params.isNew !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.isNew === params.isNew
      );
    }
    
    if (params.isHot !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.isHot === params.isHot
      );
    }
    
    // 排序
    filteredProducts.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // 分页
    const total = filteredProducts.length;
    let data = filteredProducts;
    
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      data = filteredProducts.slice(offset, offset + params.limit);
    }
    
    return { data, total };
  }

  /**
   * 查询单个商品
   */
  async findOne(id: string): Promise<any> {
    const productId = parseInt(id, 10);
    const product = this.products.find(product => product.id === productId);
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }

  /**
   * 更新商品
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const productId = parseInt(id, 10);
    const index = this.findProductIndex(productId);
    
    if (index === -1) {
      throw new NotFoundException('商品不存在');
    }
    
    // 创建更新对象，处理布尔值到数字的转换
    const updateData: any = { ...updateProductDto };
    
    if (updateProductDto.isShow !== undefined) {
      updateData.isShow = updateProductDto.isShow ? 1 : 0;
    }
    
    if (updateProductDto.isNew !== undefined) {
      updateData.isNew = updateProductDto.isNew ? 1 : 0;
    }
    
    if (updateProductDto.isHot !== undefined) {
      updateData.isHot = updateProductDto.isHot ? 1 : 0;
    }
    
    // 更新商品
    const product = {
      ...this.products[index],
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.products[index] = product;

    // 发送商品更新消息
    await this.rabbitMQService.emit('product.updated', product);

    return product;
  }

  /**
   * 删除商品
   */
  async remove(id: string): Promise<{ message: string }> {
    const productId = parseInt(id, 10);
    const index = this.findProductIndex(productId);
    
    if (index === -1) {
      throw new NotFoundException('商品不存在');
    }
    
    this.products.splice(index, 1);

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
    
    const productIds = ids.map(id => parseInt(id, 10));
    let affected = 0;
    
    // 过滤掉不存在的商品
    const validIds = productIds.filter(id => this.findProductIndex(id) !== -1);
    
    // 删除商品
    this.products = this.products.filter(product => 
      !productIds.includes(product.id)
    );
    
    affected = validIds.length;
    
    // 发送商品批量删除消息
    await this.rabbitMQService.emit('product.batch.deleted', { ids });

    return {
      message: `成功删除${affected}个商品`,
      affected,
    };
  }

  /**
   * 更新商品状态（上架/下架）
   */
  async updateStatus(id: string, isShow: boolean): Promise<any> {
    const productId = parseInt(id, 10);
    const index = this.findProductIndex(productId);
    
    if (index === -1) {
      throw new NotFoundException('商品不存在');
    }
    
    const product = {
      ...this.products[index],
      isShow: isShow ? 1 : 0,
      updatedAt: new Date(),
    };
    
    this.products[index] = product;

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
  async search(params: any): Promise<{ data: any[], total: number }> {
    let filteredProducts = [...this.products];
    
    // 搜索关键词
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(keyword) || 
        (product.description && product.description.toLowerCase().includes(keyword)) ||
        (product.details && product.details.toLowerCase().includes(keyword))
      );
    }
    
    // 分类过滤
    if (params.categoryId) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === params.categoryId
      );
    }
    
    // 品牌过滤
    if (params.brandId) {
      filteredProducts = filteredProducts.filter(product => 
        product.brandId === params.brandId
      );
    }
    
    // 上架状态过滤
    filteredProducts = filteredProducts.filter(product => product.isShow === 1);
    
    // 新品过滤
    if (params.isNew !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.isNew === params.isNew
      );
    }
    
    // 热门过滤
    if (params.isHot !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.isHot === params.isHot
      );
    }
    
    // 价格范围过滤
    if (params.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= params.minPrice
      );
    }
    if (params.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= params.maxPrice
      );
    }
    
    // 排序
    filteredProducts.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // 分页
    const total = filteredProducts.length;
    let data = filteredProducts;
    
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      data = filteredProducts.slice(offset, offset + params.limit);
    }
    
    return {
      data,
      total,
    };
  }
}
