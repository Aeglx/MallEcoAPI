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

/**
 * 防重复提交拦截器
 * 参考：MallEcoPro/src/shared/aop/interceptors/prevent-duplicate-submissions.interceptor.ts
 */
@Injectable()
export class PreventDuplicateSubmissionsInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    
    const metadata = Reflect.getMetadata('preventDuplicateSubmissions', handler);
    if (!metadata) {
      return next.handle();
    }

    const { expire, userIsolation } = metadata;
    const userId = request.user?.id || '';
    const method = request.method;
    const path = request.path;
    const body = JSON.stringify(request.body || {});

    // 构建缓存key
    let cacheKey = `duplicate:${method}:${path}:${body}`;
    if (userIsolation && userId) {
      cacheKey += `:${userId}`;
    }

    // 检查是否已存在
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      throw new HttpException('请勿重复提交', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 设置缓存
    await this.cacheManager.set(cacheKey, '1', expire * 1000);

    return next.handle();
  }
}

