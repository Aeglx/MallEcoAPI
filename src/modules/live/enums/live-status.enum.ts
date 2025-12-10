/**
 * 直播状态枚举
 */
export enum LiveStatusEnum {
  /** 未开始 */
  NOT_STARTED = 'NOT_STARTED',
  /** 直播中 */
  LIVE = 'LIVE',
  /** 已结束 */
  ENDED = 'ENDED',
  /** 已暂停 */
  PAUSED = 'PAUSED',
  /** 已取消 */
  CANCELLED = 'CANCELLED'
}

/**
 * 直播类型枚举
 */
export enum LiveTypeEnum {
  /** 普通直播 */
  NORMAL = 'NORMAL',
  /** 秒杀直播 */
  FLASH_SALE = 'FLASH_SALE',
  /** 拼团直播 */
  GROUP_BUY = 'GROUP_BUY',
  /** 新品发布 */
  NEW_PRODUCT = 'NEW_PRODUCT',
  /** 品牌活动 */
  BRAND_ACTIVITY = 'BRAND_ACTIVITY'
}

/**
 * 直播间权限枚举
 */
export enum LivePermissionEnum {
  /** 房主 */
  OWNER = 'OWNER',
  /** 管理员 */
  ADMIN = 'ADMIN',
  /** 观众 */
  VIEWER = 'VIEWER',
  /** 被禁言 */
  BANNED = 'BANNED'
}