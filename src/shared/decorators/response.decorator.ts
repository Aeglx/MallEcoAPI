import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * 统一API响应格式接口
 */
export interface ApiResponseDto<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 分页响应格式接口
 */
export interface PaginationResponseDto<T> {
  code: number;
  message: string;
  data: {
    list: T[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
}

/**
 * 通用响应装饰器
 * @param statusCode HTTP状态码
 * @param message 响应消息
 * @param type 响应数据类型
 */
export function ApiResponseDecorator<T>(statusCode: number, message: string, type?: Type<T>) {
  const responseSchema: any = {
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: statusCode },
        message: { type: 'string', example: message },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  };

  // 如果提供了数据类型，则添加data属性
  if (type) {
    responseSchema.schema.properties.data = {
      $ref: getSchemaPath(type),
    };
  } else {
    responseSchema.schema.properties.data = {
      type: 'object',
    };
  }

  return applyDecorators(
    ApiResponse({
      status: statusCode,
      ...responseSchema,
    })
  );
}

/**
 * 分页响应装饰器
 * @param statusCode HTTP状态码
 * @param message 响应消息
 * @param type 响应数据类型
 */
export function ApiPaginationResponse<T>(statusCode: number, message: string, type: Type<T>) {
  return applyDecorators(
    ApiResponse({
      status: statusCode,
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: statusCode },
          message: { type: 'string', example: message },
          timestamp: { type: 'string', format: 'date-time' },
          data: {
            type: 'object',
            properties: {
              list: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
            },
          },
        },
      },
    })
  );
}

/**
 * 成功响应装饰器
 * @param type 响应数据类型
 */
export function ApiSuccessResponse<T>(type?: Type<T>) {
  return ApiResponseDecorator(200, '操作成功', type);
}

/**
 * 创建成功响应装饰器
 * @param type 响应数据类型
 */
export function ApiCreatedResponse<T>(type?: Type<T>) {
  return ApiResponseDecorator(201, '创建成功', type);
}

/**
 * 分页成功响应装饰器
 * @param type 响应数据类型
 */
export function ApiPaginationSuccessResponse<T>(type: Type<T>) {
  return ApiPaginationResponse(200, '查询成功', type);
}
