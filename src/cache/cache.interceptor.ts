import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiCacheManager } from './api-cache-manager.service';

export interface CacheOptions {
  ttl?: number; // 生存时间（秒）
  key?: string; // 自定义缓存键
  condition?: (context: ExecutionContext) => boolean; // 缓存条件
  invalidate?: string[]; // 失效的缓存键模式
  refreshAhead?: boolean; // 预刷新
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheManager: ApiCacheManager) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.getCacheOptions(context);
    
    // 检查缓存条件
    if (options.condition && !options.condition(context)) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(context, options.key);
    
    return new Observable(observer => {
      // 先尝试从缓存获取
      this.cacheManager.get(cacheKey, options).then(cachedData => {
        if (cachedData !== null) {
          observer.next(cachedData);
          observer.complete();
          return;
        }

        // 缓存未命中，执行原方法
        return next.handle().pipe(
          tap(async (data) => {
            // 设置缓存
            await this.cacheManager.set(cacheKey, data, options);
            
            // 失效相关缓存
            if (options.invalidate) {
              for (const pattern of options.invalidate) {
                await this.cacheManager.deletePattern(pattern);
              }
            }
          }),
          catchError((error) => {
            observer.error(error);
            return of(error);
          })
        ).subscribe(observer);
      });
    });
  }

  /**
   * 获取缓存配置
   */
  private getCacheOptions(context: ExecutionContext): CacheOptions {
    const handler = context.getHandler();
    const metadata = Reflect.getMetadata('cache_options', handler);
    
    return metadata || {};
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(context: ExecutionContext, customKey?: string): string {
    if (customKey) {
      return customKey;
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, query, params } = request;
    
    // 生成基于URL和参数的缓存键
    const queryString = new URLSearchParams(query).toString();
    const paramsString = JSON.stringify(params);
    
    return `${method}:${url}:${queryString}:${paramsString}`;
  }
}

/**
 * 缓存装饰器
 */
export function Cache(options: CacheOptions = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('cache_options', options, target, propertyKey);
    return descriptor;
  };
}

/**
 * 缓存失效装饰器
 */
export function CacheInvalidate(patterns: string[] = []) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const options: CacheOptions = {
        invalidate: patterns,
      };
      
      Reflect.defineMetadata('cache_options', options, target, propertyKey);
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}