import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  code: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map(data => {
        // 如果是流式响应，直接返回
        if (data && typeof data.pipe === 'function') {
          return data;
        }

        // 如果已经是包装过的响应，直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const statusCode = response.statusCode;
        const success = statusCode >= 200 && statusCode < 300;

        return {
          success,
          data: data || null,
          message: success ? '请求成功' : '请求失败',
          timestamp: new Date().toISOString(),
          path: request.url,
          code: statusCode,
        };
      }),
    );
  }
}
