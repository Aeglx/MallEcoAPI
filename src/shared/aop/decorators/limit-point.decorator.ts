/**
 * 限流类型枚举
 */
export enum LimitTypeEnum {
  /** IP限制 */
  IP = 'IP',
  /** 自定义key限制 */
  CUSTOM = 'CUSTOM',
}

/**
 * 限流装饰器
 * 参考：MallEcoPro/src/shared/aop/decorators/limit-point.decorator.ts
 */
export const LimitPoint = (options?: {
  /** 资源的名字 */
  name?: string;
  /** 资源的key */
  key?: string;
  /** Key的prefix redis前缀 */
  prefix?: string;
  /** 给定的时间段 单位秒 */
  period?: number;
  /** 最多的访问限制次数 */
  limit?: number;
  /** 类型 ip限制 还是自定义key值限制 */
  limitType?: LimitTypeEnum;
}) => {
  const {
    name = '',
    key = '',
    prefix = '',
    period = 60,
    limit = 10,
    limitType = LimitTypeEnum.IP,
  } = options || {};

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 装饰器逻辑将在拦截器中实现
    Reflect.defineMetadata('limitPoint', { name, key, prefix, period, limit, limitType }, descriptor.value);
    return descriptor;
  };
};

