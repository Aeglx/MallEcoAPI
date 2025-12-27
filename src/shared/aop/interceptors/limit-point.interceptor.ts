import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LimitTypeEnum } from '../decorators/limit-point.decorator';

/**
 * 限流点拦截器
 * 参考：MallEcoPro/src/shared/aop/interceptors/limit-point.interceptor.ts
 */
@Injectable()
export class LimitPointInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    const metadata = Reflect.getMetadata('limitPoint', handler);
    if (!metadata) {
      return next.handle();
    }

    const { name, key, prefix, period, limit, limitType } = metadata;

    // 构建缓存key
    let cacheKey = prefix ? `${prefix}:${key}` : key;
    if (limitType === LimitTypeEnum.IP) {
      const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
      cacheKey = `${cacheKey}:${ip}`;
    }

    // 检查限流
    const current = await this.checkLimit(cacheKey, limit, period);
    if (current > limit) {
      throw new HttpException(`请求过于频繁，请稍后再试`, HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }

  private async checkLimit(key: string, limit: number, period: number): Promise<number> {
    // 使用缓存实现限流计数
    const cached = await this.cacheManager.get<number>(key);
    if (cached === undefined) {
      await this.cacheManager.set(key, 1, period * 1000);
      return 1;
    }

    const newCount = cached + 1;
    await this.cacheManager.set(key, newCount, period * 1000);
    return newCount;
  }
}
