export enum PayStatus {
  /** 待支付 */
  PENDING = 0,
  /** 支付成功 */
  SUCCESS = 1,
  /** 支付失败 */
  FAIL = 2,
  /** 已退款 */
  REFUNDED = 3,
  /** 已取消 */
  CANCELLED = 4,
  /** 支付超时 */
  TIMEOUT = 5,
}

export enum PayType {
  /** 支付宝 */
  ALIPAY = 'alipay',
  /** 微信支付 */
  WECHAT = 'wechat',
  /** 银联支付 */
  UNIONPAY = 'unionpay',
  /** 货到付款 */
  COD = 'cod',
  /** 余额支付 */
  BALANCE = 'balance',
}

export enum RefundStatus {
  /** 待退款 */
  PENDING = 0,
  /** 退款成功 */
  SUCCESS = 1,
  /** 退款失败 */
  FAIL = 2,
  /** 退款关闭 */
  CLOSED = 3,
}
