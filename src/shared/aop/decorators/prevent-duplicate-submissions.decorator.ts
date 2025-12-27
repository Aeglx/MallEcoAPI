/**
 * 防重复提交装饰器
 * 参考：MallEcoPro/src/shared/aop/decorators/prevent-duplicate-submissions.decorator.ts
 */
export const PreventDuplicateSubmissions = (options?: {
  /** 过期时间（秒），默认3秒 */
  expire?: number;
  /** 用户间隔离，默认false。如果为true则全局限制，为true需要用户登录状态 */
  userIsolation?: boolean;
}) => {
  const expire = options?.expire ?? 3;
  const userIsolation = options?.userIsolation ?? false;

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 装饰器逻辑将在拦截器中实现
    Reflect.defineMetadata(
      'preventDuplicateSubmissions',
      { expire, userIsolation },
      descriptor.value,
    );
    return descriptor;
  };
};
