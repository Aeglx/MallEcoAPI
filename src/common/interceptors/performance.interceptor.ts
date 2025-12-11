import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { PerformanceMonitorService } from '../../modules/system/services/performance-monitor.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  constructor(
    private reflector: Reflector,
    private performanceMonitorService: PerformanceMonitorService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    
    const endpoint = `${method} ${url}`;
    
    // 跳过性能监控的路由
    const skipPerformance = this.reflector.get<boolean>(
      'skipPerformance',
      context.getHandler(),
    );
    
    if (skipPerformance) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          const statusCode = response.statusCode;
          
          // 记录到性能监控服务
          this.performanceMonitorService.recordApiResponse(
            endpoint,
            responseTime,
            statusCode,
          );
          
          // 如果响应时间超过阈值，记录警告日志
          const threshold = 1000; // 1秒
          if (responseTime > threshold) {
            this.logger.warn(
              `Slow API call: ${endpoint} took ${responseTime}ms (status: ${statusCode})`,
            );
          }
          
          // 记录到标准日志
          this.logger.log(
            `${method} ${url} ${statusCode} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const statusCode = error.status || 500;
          
          // 记录到性能监控服务
          this.performanceMonitorService.recordApiResponse(
            endpoint,
            responseTime,
            statusCode,
          );
          
          this.logger.error(
            `${method} ${url} ${statusCode} - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}