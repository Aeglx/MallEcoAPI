/**
 * 统一响应结果工具类
 * 参考：MallEcoPro/src/shared/utils/result.util.ts
 */
export interface ResultMessage<T = any> {
  success: boolean;
  message: string;
  code: number;
  result?: T;
  data?: T;
  timestamp?: string;
}

export enum ResultCode {
  SUCCESS = 200,
  ERROR = 500,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

export const ResultCodeMessage: Record<ResultCode, string> = {
  [ResultCode.SUCCESS]: '操作成功',
  [ResultCode.ERROR]: '操作失败',
  [ResultCode.BAD_REQUEST]: '请求参数错误',
  [ResultCode.UNAUTHORIZED]: '未授权',
  [ResultCode.FORBIDDEN]: '权限不足',
  [ResultCode.NOT_FOUND]: '资源不存在',
};

/**
 * 返回结果工具类
 */
export class ResultUtil {
  /**
   * 返回数据
   */
  static data<T>(data: T): ResultMessage<T> {
    return {
      success: true,
      message: ResultCodeMessage[ResultCode.SUCCESS],
      code: ResultCode.SUCCESS,
      result: data,
      data: data, // 同时设置data字段，兼容不同前端
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 返回成功消息
   */
  static success<T>(resultCode: ResultCode = ResultCode.SUCCESS): ResultMessage<T> {
    return {
      success: true,
      message: ResultCodeMessage[resultCode],
      code: resultCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 返回成功消息（带自定义消息）
   */
  static successWithMessage<T>(message: string, code: ResultCode = ResultCode.SUCCESS): ResultMessage<T> {
    return {
      success: true,
      message,
      code,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 返回失败消息
   */
  static error<T>(resultCode: ResultCode = ResultCode.ERROR, message?: string): ResultMessage<T> {
    return {
      success: false,
      message: message || ResultCodeMessage[resultCode],
      code: resultCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 返回失败消息（带自定义消息）
   */
  static errorWithMessage<T>(message: string, code: ResultCode = ResultCode.ERROR): ResultMessage<T> {
    return {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
    };
  }
}

