import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class MonitoringMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    // 记录请求开始时�?
    res.locals.startTime = startTime;

    // 重写send方法以捕获响应时�?
    res.send = function(body?: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 记录HTTP指标
      const route = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode;

      // 排除监控端点自身
      if (!route.includes('./infrastructure/monitoring')) {
        this.prometheusService.recordHttpRequest(method, route, statusCode, duration);
      }

      return originalSend.call(this, body);
    }.bind(this);

    next();
  }
}
