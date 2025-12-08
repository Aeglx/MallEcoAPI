// 订单状态枚举
export enum OrderStatus {
  UNPAID = 0, // 未付款
  PAID = 1, // 已付款
  UNDELIVERED = 2, // 待发货
  PARTS_DELIVERED = 3, // 部分发货
  DELIVERED = 4, // 已发货
  COMPLETED = 5, // 已完成
  STAY_PICKED_UP = 6, // 待自提
  TAKE = 7, // 待核验
  CANCELLED = 8, // 已关闭
}

// 支付状态枚举
export enum PayStatus {
  UNPAID = 0, // 待付款
  PAID = 1, // 已付款
  CANCEL = 2, // 已取消
}

// 配送状态枚举
export enum ShipStatus {
  UNDELIVERED = 0, // 未发货
  PARTS_DELIVERED = 1, // 部分发货
  DELIVERED = 2, // 已发货
  RECEIVED = 3, // 已收货
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay', // 支付宝
  WECHAT = 'wechat', // 微信
  BANK = 'bank', // 银行转账
  CASH = 'cash', // 现金
}

// 配送方式枚举
export enum DeliveryMethod {
  LOGISTICS = 'logistics', // 物流配送
  SELF_PICK_UP = 'self_pick_up', // 自提
}
