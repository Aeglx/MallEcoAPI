import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PerformanceService } from '../monitoring/performance.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly performanceService: PerformanceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const startTime = Date.now();
    const method = request.method;
    const path = request.route?.path || request.path;

    // 增加活跃请求计数
    this.performanceService.incrementActiveRequests();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000; // 转换为秒
          const status = response.statusCode;
          
          // 记录API性能指标
          this.performanceService.recordApiRequest(method, path, duration, status);
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode || 500;
          
          // 记录错误API请求
          this.performanceService.recordApiRequest(method, path, duration, status);
        },
        finalize: () => {
          // 减少活跃请求计数
          this.performanceService.decrementActiveRequests();
        },
      }),
    );
  }
}