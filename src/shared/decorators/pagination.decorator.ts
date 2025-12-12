import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * 分页参数装饰器，用于从请求中提取分页参数
 */
export const Pagination = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  
  // 获取查询参数
  const page = parseInt(request.query.page as string) || 1;
  const limit = parseInt(request.query.limit as string) || 10;
  
  // 确保页码和每页数量的有效性
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, Math.min(100, limit)); // 限制最大每页数量为100
  
  // 计算跳过的记录数
  const skip = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    skip,
    take: validLimit,
  };
});

/**
 * 分页参数类型定义
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}
