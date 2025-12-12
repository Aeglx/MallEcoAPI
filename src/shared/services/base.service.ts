import { Repository, DeepPartial, FindManyOptions, FindOneOptions, DeleteResult, ObjectLiteral } from 'typeorm';

/**
 * 基础服务抽象类，提供通用的数据操作方法
 * @template T 实体类型，必须继承自ObjectLiteral
 */
export abstract class BaseService<T extends ObjectLiteral> {
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
  async findAll(query?: any): Promise<T[] | { data: T[]; total: number }> {
    try {
      if (query?.page && query?.limit) {
        // 分页查询
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;
        
        // 移除分页参数，保留其他查询条件
        const { page, limit, ...where } = query;
          
          // 构建排序选项
          const order: any = { createdAt: 'DESC' };
          
          const [data, total] = await this.repository.findAndCount({
          skip,
          take,
          where: where || {},
          order,
          ...this.buildQueryOptions(query),
        });
        
        return { data, total };
      } else {
          // 普通查询
          // 构建排序选项
          const order: any = { createdAt: 'DESC' };
          
          const options: FindManyOptions<T> = {
          order,
          ...this.buildQueryOptions(query),
        };
        
        if (query && Object.keys(query).length > 0) {
          options.where = query;
        }
        
        return await this.repository.find(options);
      }
    } catch (error) {
      console.error('查询列表失败:', error);
      throw error;
    }
  }

  /**
   * 查询详情
   * @param id 实体ID
   * @returns 实体详情
   */
  async findOne(id: string | FindOneOptions<T>): Promise<T | null> {
    try {
      if (typeof id === 'string') {
        return await this.repository.findOneBy({ id } as any);
      }
      return await this.repository.findOne(id);
    } catch (error) {
      console.error('查询详情失败:', error);
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
      const entity = this.repository.create(createDto);
      return await this.repository.save(entity);
    } catch (error) {
      console.error('创建实体失败:', error);
      throw error;
    }
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
