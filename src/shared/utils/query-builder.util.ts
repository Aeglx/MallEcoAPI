import { FindManyOptions, Like } from 'typeorm';

export class QueryBuilderUtil {
  /**
   * 构建分页查询选项
   */
  static buildPaginationOptions(
    page?: number,
    limit?: number,
  ): Pick<FindManyOptions<any>, 'skip' | 'take'> {
    if (!page || !limit) return {};
    
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * 构建排序选项
   */
  static buildOrderOptions(
    defaultSort: string = 'createdAt',
    defaultOrder: 'ASC' | 'DESC' = 'DESC',
    customOrder?: Record<string, 'ASC' | 'DESC'>,
  ): Pick<FindManyOptions<any>, 'order'> {
    const order: Record<string, 'ASC' | 'DESC'> = {
      [defaultSort]: defaultOrder,
    };
    
    if (customOrder) {
      Object.assign(order, customOrder);
    }
    
    return { order };
  }

  /**
   * 构建查询条件
   */
  static buildWhereConditions(
    query: any,
    searchableFields?: string[],
    dateFields?: string[],
  ): Pick<FindManyOptions<any>, 'where'> {
    if (!query || Object.keys(query).length === 0) return {};
    
    const where: any = {};
    
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // 处理分页参数
      if (key === 'page' || key === 'limit') {
        continue;
      }
      
      // 处理模糊查询字段
      if (searchableFields?.includes(key) && typeof value === 'string') {
        where[key] = Like(`%${value}%`);
      }
      // 处理精确匹配字段
      else if (!searchableFields?.includes(key)) {
        where[key] = value;
      }
      // 处理日期范围查询
      else if (dateFields?.includes(key)) {
        if (typeof value === 'object' && value && 'start' in value && 'end' in value) {
          where[key] = {
            $gte: (value as any).start,
            $lte: (value as any).end,
          };
        }
      }
    }
    
    return { where };
  }

  /**
   * 构建完整的查询选项
   */
  static buildQueryOptions(
    query: any,
    options?: {
      searchableFields?: string[];
      dateFields?: string[];
      defaultSort?: string;
      defaultOrder?: 'ASC' | 'DESC';
      customOrder?: Record<string, 'ASC' | 'DESC'>;
    },
  ): FindManyOptions<any> {
    const { searchableFields, dateFields, defaultSort, defaultOrder, customOrder } = options || {};
    
    return {
      ...this.buildWhereConditions(query, searchableFields, dateFields),
      ...this.buildPaginationOptions(query?.page, query?.limit),
      ...this.buildOrderOptions(defaultSort, defaultOrder, customOrder),
    };
  }

  /**
   * 处理查询结果，统一返回格式
   */
  static formatQueryResult<T>(
    data: T[],
    total: number,
    page?: number,
    limit?: number,
  ) {
    return {
      data,
      total,
      page: page || 1,
      limit: limit || data.length,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  }
}

/**
 * 分页查询参数接口
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 查询结果接口
 */
export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}