import { HttpException, HttpStatus } from '@nestjs/common';
import { CodeEnum } from '../enums/code.enum';

export class CustomException extends HttpException {
  constructor(code: CodeEnum, message?: string) {
    const messages = {
      [CodeEnum.USER_NOT_FOUND]: '用户不存在',
      [CodeEnum.USER_DISABLED]: '用户已被禁用',
      [CodeEnum.PASSWORD_INCORRECT]: '密码错误',
      [CodeEnum.PRODUCT_NOT_FOUND]: '商品不存在',
      [CodeEnum.PRODUCT_OUT_OF_STOCK]: '商品库存不足',
      [CodeEnum.PRODUCT_OFF_SHELF]: '商品已下架',
      [CodeEnum.ORDER_NOT_FOUND]: '订单不存在',
      [CodeEnum.ORDER_STATUS_INVALID]: '订单状态无效',
      [CodeEnum.ORDER_CANNOT_CANCEL]: '订单无法取消',
      [CodeEnum.PAYMENT_FAILED]: '支付失败',
      [CodeEnum.PAYMENT_TIMEOUT]: '支付超时',
      [CodeEnum.PAYMENT_CANCELLED]: '支付已取消',
      [CodeEnum.DISTRIBUTION_NOT_FOUND]: '分销员不存在',
      [CodeEnum.DISTRIBUTION_ALREADY_APPROVED]: '分销员已通过审核',
      [CodeEnum.DISTRIBUTION_ALREADY_AUDITED]: '分销员申请已审核',
      [CodeEnum.DISTRIBUTION_APPLY_PENDING]: '分销员申请待审核',
      [CodeEnum.INSUFFICIENT_COMMISSION]: '可用佣金不足',
      [CodeEnum.MIN_CASH_AMOUNT]: '提现金额低于最低限额',
      [CodeEnum.CASH_APPLICATION_PENDING]: '有待处理的提现申请',
      [CodeEnum.CASH_NOT_FOUND]: '提现申请不存在',
      [CodeEnum.CASH_ALREADY_AUDITED]: '提现申请已审核',
      [CodeEnum.CASH_NOT_APPROVED]: '提现申请未通过审核',
      [CodeEnum.SYSTEM_ERROR]: '系统错误',
      [CodeEnum.DATABASE_ERROR]: '数据库错误',
      [CodeEnum.EXTERNAL_SERVICE_ERROR]: '外部服务错误',
      [CodeEnum.NETWORK_ERROR]: '网络错误',
    };

    const errorMessage = message || messages[code] || '未知错误';

    super(
      {
        code,
        message: errorMessage,
        timestamp: Date.now(),
        traceId: '',
      },
      HttpStatus.OK,
    );
  }
}