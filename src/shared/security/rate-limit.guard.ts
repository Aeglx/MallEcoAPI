import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { Request } from 'express';

// 使用passport提供的Request.user定义，无需重复声明

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // 获取客户端标识符（优先使用用户ID，其次使用IP）
    const identifier = this.getClientIdentifier(request);
    
    // 获取API路径
    const apiPath = request.route?.path || request.path;
    
    // 根据API路径选择限流配置
    const config = this.getRateLimitConfig(apiPath);
    
    // 检查限流
    const result = await this.rateLimiterService.checkApiRateLimit(apiPath, identifier, config);
    
    // 设置响应头
    this.setRateLimitHeaders(response, result);
    
    if (!result.allowed) {
      throw new HttpException(
        config.message || '请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return true;
  }

  private getClientIdentifier(request: Request): string {
    // 优先使用认证用户ID
    if (request.user && (request.user as any).id) {
      return `user:${(request.user as any).id}`;
    }
    
    // 使用IP地址
    const ip = this.getClientIp(request);
    return `ip:${ip}`;
  }

  private getClientIp(request: Request): string {
    // 获取真实IP（考虑代理情况）
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
    }
    
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }
    
    return request.ip || 'unknown';
  }

  private getRateLimitConfig(apiPath: string): any {
    const predefinedConfigs = this.rateLimiterService.getPredefinedConfigs();
    
    // 根据API路径匹配预定义配置
    if (apiPath.includes('/auth/login')) {
      return predefinedConfigs.login;
    }
    
    if (apiPath.includes('/auth/register')) {
      return predefinedConfigs.register;
    }
    
    if (apiPath.includes('/sms') || apiPath.includes('/captcha')) {
      return predefinedConfigs.sms;
    }
    
    // 默认使用API通用配置
    return predefinedConfigs.api;
  }

  private setRateLimitHeaders(response: any, result: any): void {
    response.setHeader('X-RateLimit-Limit', result.maxRequests || 60);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
  }
}

// 自定义限流装饰器
export function RateLimit(config?: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const request = args[0]?.req || args[0];
      const rateLimiterService = this.rateLimiterService || 
        (this as any).moduleRef?.get(RateLimiterService);
      
      if (rateLimiterService && request) {
        const identifier = this.getClientIdentifier?.(request) || 'unknown';
        const apiPath = request.route?.path || request.path;
        
        const result = await rateLimiterService.checkApiRateLimit(apiPath, identifier, config);
        
        if (!result.allowed) {
          throw new HttpException(
            config?.message || '请求过于频繁，请稍后再试',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}