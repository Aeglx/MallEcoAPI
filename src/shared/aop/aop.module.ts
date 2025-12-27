import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { PreventDuplicateSubmissionsInterceptor } from './interceptors/prevent-duplicate-submissions.interceptor';
import { LimitPointInterceptor } from './interceptors/limit-point.interceptor';

/**
 * AOP模块
 * 提供防重复提交、限流点等AOP功能
 * 参考：MallEcoPro/src/shared/aop/aop.module.ts
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 默认5分钟
      max: 100, // 最大缓存项数
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PreventDuplicateSubmissionsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LimitPointInterceptor,
    },
  ],
  exports: [],
})
export class AopModule {}
