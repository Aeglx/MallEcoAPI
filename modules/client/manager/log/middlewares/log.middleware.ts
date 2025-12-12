import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../log.service';
import { LogType, LogOperationType } from '../entities/log.entity';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LogMiddleware.name);

  constructor(private readonly logService: LogService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, body, query, headers, ip } = req;
    const userAgent = headers['user-agent'];

    // 记录请求信息
    this.logger.log(`Request: ${method} ${originalUrl} from ${ip}`);

    // 监听响应结束事件
    res.on('finish', async () => {
      const { statusCode } = res;
      const responseTime = Date.now() - start;

      // 构建日志数据
      // 将HTTP方法映射到LogOperationType枚举
      let logOperationType: LogOperationType;
      switch (method) {
        case 'GET':
          logOperationType = LogOperationType.GET;
          break;
        case 'POST':
          logOperationType = LogOperationType.POST;
          break;
        case 'PUT':
          logOperationType = LogOperationType.PUT;
          break;
        case 'PATCH':
          logOperationType = LogOperationType.PATCH;
          break;
        case 'DELETE':
          logOperationType = LogOperationType.DELETE;
          break;
        default:
          logOperationType = LogOperationType.OTHER;
      }

      // 构建日志数据
      const logData = {
        logType: LogType.HTTP_REQUEST,
        operationType: logOperationType,
        operatorId: req['user']?.id || 'anonymous',
        operatorName: req['user']?.username || 'anonymous',
        content: `HTTP ${method} ${originalUrl}`,
        ipAddress: ip,
        requestMethod: method,
        requestUrl: originalUrl,
        responseCode: statusCode,
        requestParams: JSON.stringify(query),
        responseData: statusCode >= 400 ? `HTTP Error: ${statusCode}` : 'SUCCESS',
        responseTime: responseTime,
      };

      try {
        // 保存日志到数据库
        await this.logService.create(logData);
      } catch (error) {
        this.logger.error('Failed to save log:', error);
      }
    });

    next();
  }

  // 清理请求体，移除敏感信息
  private sanitizeBody(body: any): string {
    if (!body) return JSON.stringify({});

    const sanitized = { ...body };
    // 移除常见的敏感信息字段
    const sensitiveFields = ['password', 'passwordConfirm', 'token', 'accessToken', 'refreshToken'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return JSON.stringify(sanitized);
  }
}