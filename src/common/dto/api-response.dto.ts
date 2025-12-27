export class ApiResponseDto<T = any> {
  /**
   * 响应状态码
   */
  code: number;

  /**
   * 响应消息
   */
  message: string;

  /**
   * 响应数据
   */
  data?: T;

  /**
   * 时间戳
   */
  timestamp: string;

  /**
   * 请求路径
   */
  path?: string;

  constructor(code: number, message: string, data?: T, path?: string) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }

  static success<T>(data?: T | T[], message = '操作成功', path?: string): ApiResponseDto<T | T[]> {
    return new ApiResponseDto(200, message, data, path);
  }

  static error(message = '操作失败', code = 500, path?: string): ApiResponseDto {
    return new ApiResponseDto(code, message, null, path);
  }

  static created<T>(data?: T, message = '创建成功', path?: string): ApiResponseDto<T> {
    return new ApiResponseDto(201, message, data, path);
  }

  static updated<T>(data?: T, message = '更新成功', path?: string): ApiResponseDto<T> {
    return new ApiResponseDto(200, message, data, path);
  }

  static deleted(message = '删除成功', path?: string): ApiResponseDto {
    return new ApiResponseDto(200, message, null, path);
  }
}

export class PaginationResponseDto<T = any> extends ApiResponseDto<T[]> {
  /**
   * 分页信息
   */
  pagination: {
    /**
     * 当前页码
     */
    page: number;
    /**
     * 每页条数
     */
    limit: number;
    /**
     * 总记录数
     */
    total: number;
    /**
     * 总页数
     */
    totalPages: number;
    /**
     * 是否有下一页
     */
    hasNext: boolean;
    /**
     * 是否有上一页
     */
    hasPrev: boolean;
  };

  constructor(code: number, message: string, data: T[], pagination: any, path?: string) {
    super(code, message, data, path);
    this.pagination = pagination;
  }

  static success<T>(
    data: T[],
    pagination: any,
    message = '获取成功',
    path?: string,
  ): PaginationResponseDto<T> {
    return new PaginationResponseDto(200, message, data, pagination, path);
  }
}
