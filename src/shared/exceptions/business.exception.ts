import { HttpException, HttpStatus } from '@nestjs/common';

export enum BusinessErrorCode {
  // 通用错误码
  VALIDATION_FAILED = 1001,
  DATA_NOT_FOUND = 1002,
  DATA_EXISTS = 1003,
  PERMISSION_DENIED = 1004,
  UNAUTHORIZED = 1005,
  
  // 业务错误码
  PRODUCT_NOT_FOUND = 2001,
  PRODUCT_STOCK_INSUFFICIENT = 2002,
  ORDER_NOT_FOUND = 2003,
  ORDER_STATUS_INVALID = 2004,
  
  // 分销错误码
  DISTRIBUTOR_NOT_FOUND = 3001,
  DISTRIBUTOR_ALREADY_EXISTS = 3002,
  INVITE_CODE_INVALID = 3003,
  COMMISSION_CALCULATION_FAILED = 3004,
  
  // 支付错误码
  PAYMENT_FAILED = 4001,
  PAYMENT_AMOUNT_INVALID = 4002,
  PAYMENT_TIMEOUT = 4003,
  
  // 系统错误码
  SYSTEM_ERROR = 5001,
  DATABASE_ERROR = 5002,
  EXTERNAL_SERVICE_ERROR = 5003,
}

export class BusinessException extends HttpException {
  constructor(
    code: BusinessErrorCode,
    message: string,
    details?: any,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }

  // 快速创建业务异常的方法
  static validationFailed(message: string, details?: any) {
    return new BusinessException(BusinessErrorCode.VALIDATION_FAILED, message, details);
  }

  static dataNotFound(message: string, details?: any) {
    return new BusinessException(BusinessErrorCode.DATA_NOT_FOUND, message, details, HttpStatus.NOT_FOUND);
  }

  static dataExists(message: string, details?: any) {
    return new BusinessException(BusinessErrorCode.DATA_EXISTS, message, details, HttpStatus.CONFLICT);
  }

  static permissionDenied(message: string, details?: any) {
    return new BusinessException(BusinessErrorCode.PERMISSION_DENIED, message, details, HttpStatus.FORBIDDEN);
  }

  static unauthorized(message: string, details?: any) {
    return new BusinessException(BusinessErrorCode.UNAUTHORIZED, message, details, HttpStatus.UNAUTHORIZED);
  }

  // 业务相关异常
  static productNotFound(productId: string) {
    return new BusinessException(BusinessErrorCode.PRODUCT_NOT_FOUND, `商品 ${productId} 不存在`, { productId }, HttpStatus.NOT_FOUND);
  }

  static productStockInsufficient(productId: string, requested: number, available: number) {
    return new BusinessException(BusinessErrorCode.PRODUCT_STOCK_INSUFFICIENT, '商品库存不足', { productId, requested, available });
  }

  static distributorNotFound(distributorId: string) {
    return new BusinessException(BusinessErrorCode.DISTRIBUTOR_NOT_FOUND, `分销员 ${distributorId} 不存在`, { distributorId }, HttpStatus.NOT_FOUND);
  }

  static distributorAlreadyExists(memberId: string) {
    return new BusinessException(BusinessErrorCode.DISTRIBUTOR_ALREADY_EXISTS, `用户 ${memberId} 已经是分销员`, { memberId }, HttpStatus.CONFLICT);
  }

  static inviteCodeInvalid(inviteCode: string) {
    return new BusinessException(BusinessErrorCode.INVITE_CODE_INVALID, `邀请码 ${inviteCode} 无效`, { inviteCode });
  }
}