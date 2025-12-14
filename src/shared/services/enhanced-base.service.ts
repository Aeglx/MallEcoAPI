import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository, DeepPartial, FindManyOptions, FindOneOptions, DeleteResult, ObjectLiteral, In } from 'typeorm';

/**
 * 增强的基础服务类，提供更强大的通用数据操作方法
 * 解决代码重复问题，统一CRUD操作模式
 * @template T 实体类型
 */
@Injectable()
export abstract class EnhancedBaseService<T extends ObjectLiteral> {
  protected abstract getEntityName(): string;

  constructor(protected readonly repository: Repository<T>) {}

  /**
   * 查询列表（支持分页和条件查询）
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    where?: any;
    order?: any;
    relations?: string[];
  }): Promise<{ data: T[]; total: number }> {
    try {
      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await this.repository.findAndCount({
        where: query?.where || {},
        order: query?.order || {},
        relations: query?.relations || [],
        skip,
        take: limit,
      });

      return { data, total };
    } catch (error) {
      throw this.handleError('查询列表失败', error);
    }
  }

  /**
   * 根据ID查询实体（自动处理不存在的情况）
   */
  async findById(id: string, relations?: string[]): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as any,
        relations: relations || [],
      });

      if (!entity) {
        throw new NotFoundException(`${this.getEntityName()}不存在`);
      }

      return entity;
    } catch (error) {
      throw this.handleError('查询详情失败', error);
    }
  }

  /**
   * 根据字段查询单个实体
   */
  async findOneBy(field: string, value: any, relations?: string[]): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: { [field]: value } as any,
        relations: relations || [],
      });
    } catch (error) {
      throw this.handleError('根据字段查询失败', error);
    }
  }

  /**
   * 创建实体（支持唯一性检查）
   */
  async create(createDto: DeepPartial<T>): Promise<T> {
    try {
      // 检查唯一性约束
      await this.checkUniqueConstraints(createDto);
      
      const entity = this.repository.create(createDto);
      return await this.repository.save(entity);
    } catch (error) {
      throw this.handleError('创建实体失败', error);
    }
  }

  /**
   * 更新实体
   */
  async update(id: string, updateDto: DeepPartial<T>): Promise<T> {
    try {
      // 检查实体是否存在
      await this.findById(id);
      
      // 检查唯一性约束（排除当前实体）
      await this.checkUniqueConstraints(updateDto, id);
      
      await this.repository.update(id, updateDto as any);
      return await this.findById(id);
    } catch (error) {
      throw this.handleError('更新实体失败', error);
    }
  }

  /**
   * 删除实体
   */
  async remove(id: string): Promise<void> {
    try {
      // 检查实体是否存在
      await this.findById(id);
      
      await this.repository.delete(id);
    } catch (error) {
      throw this.handleError('删除实体失败', error);
    }
  }

  /**
   * 软删除实体
   */
  async softRemove(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      
      // 如果实体有deleteFlag字段，则使用软删除
      if ('deleteFlag' in entity) {
        await this.repository.update(id, { deleteFlag: true } as any);
      } else {
        await this.remove(id);
      }
    } catch (error) {
      throw this.handleError('软删除实体失败', error);
    }
  }

  /**
   * 批量创建
   */
  async createMany(createDtos: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = this.repository.create(createDtos);
      return await this.repository.save(entities);
    } catch (error) {
      throw this.handleError('批量创建失败', error);
    }
  }

  /**
   * 批量更新
   */
  async updateMany(ids: string[], updateDto: DeepPartial<T>): Promise<void> {
    try {
      await this.repository.update(ids, updateDto as any);
    } catch (error) {
      throw this.handleError('批量更新失败', error);
    }
  }

  /**
   * 批量删除
   */
  async removeMany(ids: string[]): Promise<void> {
    try {
      await this.repository.delete(ids);
    } catch (error) {
      throw this.handleError('批量删除失败', error);
    }
  }

  /**
   * 统计数量
   */
  async count(where?: any): Promise<number> {
    try {
      return await this.repository.count({ where: where || {} });
    } catch (error) {
      throw this.handleError('统计数量失败', error);
    }
  }

  /**
   * 检查是否存在
   */
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.repository.count({ where });
      return count > 0;
    } catch (error) {
      throw this.handleError('检查存在性失败', error);
    }
  }

  /**
   * 检查唯一性约束（可被子类重写）
   */
  protected async checkUniqueConstraints(dto: DeepPartial<T>, excludeId?: string): Promise<void> {
    // 子类可以重写此方法来检查唯一性约束
  }

  /**
   * 统一错误处理
   */
  protected handleError(operation: string, error: any): Error {
    // 如果是已知的异常，直接抛出
    if (error instanceof NotFoundException || 
        error instanceof BadRequestException || 
        error instanceof ConflictException) {
      return error;
    }

    // 数据库唯一约束错误
    if (error?.code === 'ER_DUP_ENTRY') {
      return new ConflictException('数据已存在');
    }

    // 数据库外键约束错误
    if (error?.code === 'ER_NO_REFERENCED_ROW') {
      return new BadRequestException('关联数据不存在');
    }

    // 其他错误
    console.error(`${operation}:`, error);
    return new BadRequestException(`${operation}: ${error.message}`);
  }

  /**
   * 构建查询条件
   */
  protected buildWhereConditions(filters: Record<string, any>): any {
    const where: any = {};
    
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes(',')) {
          // 处理逗号分隔的多个值
          where[key] = In(value.split(','));
        } else {
          where[key] = value;
        }
      }
    }
    
    return where;
  }
}