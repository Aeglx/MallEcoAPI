import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前用户信息的装饰器
 * @param data 要获取的用户属性，比如 'id', 'username', 'storeId' 等
 * @param ctx 执行上下文
 * @returns 用户信息或指定属性的值
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);