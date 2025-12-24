import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository, DeepPartial, FindManyOptions, FindOneOptions, DeleteResult, ObjectLiteral, Like } from 'typeorm';
import { QueryBuilderUtil, PaginationParams, QueryResult } from '../utils/query-builder.util';

/**
 * 基础服务抽象类，提供通用的数据操作方法
 * @template T 实体类型，必须继承自ObjectLiteral
 */
@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  protected abstract getEntityName(): string;
  /**
   * 构造函数，注入仓库实例
   * @param repository 数据仓库实例
   */
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * 查询列表
   * @param query 查询参数
   * @returns 实体列表或带总数的分页结果
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    [key: string]: any;
  }): Promise<T[] | QueryResult<T>> {
    try {
      const searchOptions = this.getEntitySearchOptions();
      const options = QueryBuilderUtil.buildQueryOptions(query, {
        searchableFields: searchOptions.searchableFields,
        dateFields: searchOptions.dateFields,
        defaultSort: searchOptions.defaultSort || 'createdAt',
        defaultOrder: searchOptions.defaultOrder || 'DESC',
        customOrder: searchOptions.customOrder,
      });

      if (query?.page && query?.limit) {
        // 分页查询
        const [data, total] = await this.repository.findAndCount(options);
        return QueryBuilderUtil.formatQueryResult(data, total, query.page, query.limit);
      } else {
        // 普通查询
        return await this.repository.find(options);
      }
    } catch (error) {
      console.error('查询列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取实体搜索选项配置
   * 子类可以重写此方法来定制搜索行为
   */
  protected getEntitySearchOptions() {
    return {
      searchableFields: [] as string[], // 支持模糊查询的字段
      dateFields: [] as string[], // 日期字段
      defaultSort: 'createdAt', // 默认排序字段
      defaultOrder: 'DESC' as const, // 默认排序方向
      customOrder: {} as Record<string, 'ASC' | 'DESC'>, // 自定义排序
    };
  }

  /**
   * 查询详情
   * @param id 实体ID
   * @returns 实体详情
   */
  async findOne(id: string | FindOneOptions<T>): Promise<T> {
    try {
      let entity: T | null;
      if (typeof id === 'string') {
        entity = await this.repository.findOneBy({ id } as any);
      } else {
        entity = await this.repository.findOne(id);
      }
      
      if (!entity) {
        throw new NotFoundException(`${this.getEntityName()}不存在`);
      }
      
      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('查询详情失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID查询，如果不存在返回null
   */
  async findById(id: string): Promise<T | null> {
    try {
      return await this.repository.findOneBy({ id } as any);
    } catch (error) {
      console.error('根据ID查询失败:', error);
      throw error;
    }
  }

  /**
   * 根据字段查询单个实体
   */
  async findByField(field: string, value: any): Promise<T | null> {
    try {
      const where = { [field]: value };
      return await this.repository.findOne({ where } as any);
    } catch (error) {
      console.error('根据字段查询失败:', error);
      throw error;
    }
  }

  /**
   * 创建实体
   * @param createDto 创建数据
   * @returns 创建的实体
   */
  async create(createDto: DeepPartial<T>): Promise<T> {
    try {
      // 检查唯一性约束
      await this.checkUniqueConstraints(createDto);
      
      const entity = this.repository.create(createDto);
      return await this.repository.save(entity);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('创建实体失败:', error);
      throw error;
    }
  }

  /**
   * 检查唯一性约束
   */
  protected async checkUniqueConstraints(createDto: DeepPartial<T>): Promise<void> {
    // 子类可以重写此方法来检查唯一性约束
  }

  /**
   * 更新实体
   * @param id 实体ID
   * @param updateDto 更新数据
   * @returns 更新后的实体
   */
  async update(id: string, updateDto: DeepPartial<T>): Promise<T> {
    try {
      // 使用类型断言处理updateDto的类型
      await this.repository.update(id, updateDto as any);
      return this.findOne(id) as Promise<T>;
    } catch (error) {
      console.error('更新实体失败:', error);
      throw error;
    }
  }

  /**
   * 删除实体
   * @param id 实体ID
   * @returns 删除结果
   */
  async remove(id: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      console.error('删除实体失败:', error);
      throw error;
    }
  }

  /**
   * 构建查询选项
   * @param query 查询参数
   * @returns 查询选项
   */
  protected buildQueryOptions(query?: any): FindManyOptions<T> {
    const options: FindManyOptions<T> = {};
    
    // 处理模糊查询
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'string' && value.includes('%')) {
          if (!options.where) options.where = {};
          (options.where as any)[key] = Like(value);
        }
      }
    }
    
    // 可以在子类中重写此方法以添加特定的查询逻辑
    // 例如：处理关系查询、自定义排序等
    
    return options;
  }

  /**
   * 批量创建
   * @param createDtos 创建数据列表
   * @returns 创建的实体列表
   */
  async createMany(createDtos: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = this.repository.create(createDtos);
      return await this.repository.save(entities);
    } catch (error) {
      console.error('批量创建实体失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除
   * @param ids 实体ID列表
   * @returns 删除结果
   */
  async removeMany(ids: string[]): Promise<DeleteResult> {
    try {
      return await this.repository.delete(ids);
    } catch (error) {
      console.error('批量删除实体失败:', error);
      throw error;
    }
  }
}
