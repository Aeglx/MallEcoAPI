/**
 * 分销订单状态枚举
 */
export enum DistributionOrderStatusEnum {
  /** 未完成 */
  NO_COMPLETED = 'NO_COMPLETED',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
  /** 已退款 */
  REFUNDED = 'REFUNDED'
}