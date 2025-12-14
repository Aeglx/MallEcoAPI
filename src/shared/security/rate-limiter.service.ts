import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  keyPrefix: string; // Redis键前缀
  message?: string; // 限制时的错误消息
}

@Injectable()
export class RateLimiterService {
  private redis: Redis;
  private defaultConfig: RateLimitConfig = {
    windowMs: 60000, // 1分钟
    maxRequests: 100, // 最多100次请求
    keyPrefix: 'rate_limit',
    message: '请求过于频繁，请稍后再试',
  };

  constructor() {
    // 初始化Redis连接
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });
  }

  /**
   * 检查请求是否被限制
   */
  async checkRateLimit(
    identifier: string, // 标识符（如IP、用户ID）
    config?: Partial<RateLimitConfig>,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}:${identifier}`;

    try {
      const now = Date.now();
      const windowStart = now - finalConfig.windowMs;

      // 使用Redis事务确保原子性操作
      const pipeline = this.redis.pipeline();
      
      // 移除过期的请求记录
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // 添加当前请求
      pipeline.zadd(key, now, now.toString());
      
      // 设置过期时间
      pipeline.expire(key, Math.ceil(finalConfig.windowMs / 1000));
      
      // 获取当前窗口内的请求数
      pipeline.zcard(key);
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis事务执行失败');
      }

      const currentRequests = results[3][1] as number;
      const remaining = Math.max(0, finalConfig.maxRequests - currentRequests);
      
      return {
        allowed: currentRequests <= finalConfig.maxRequests,
        remaining,
        resetTime: now + finalConfig.windowMs,
      };
    } catch (error) {
      // Redis连接失败时，默认允许请求
      console.error('Rate limit check failed:', error);
      return {
        allowed: true,
        remaining: finalConfig.maxRequests,
        resetTime: Date.now() + finalConfig.windowMs,
      };
    }
  }

  /**
   * 针对IP的限流
   */
  async checkIpRateLimit(ip: string, config?: Partial<RateLimitConfig>) {
    return this.checkRateLimit(`ip:${ip}`, config);
  }

  /**
   * 针对用户的限流
   */
  async checkUserRateLimit(userId: string, config?: Partial<RateLimitConfig>) {
    return this.checkRateLimit(`user:${userId}`, config);
  }

  /**
   * 针对API端点的限流
   */
  async checkApiRateLimit(apiPath: string, identifier: string, config?: Partial<RateLimitConfig>) {
    return this.checkRateLimit(`api:${apiPath}:${identifier}`, config);
  }

  /**
   * 获取限流统计信息
   */
  async getRateLimitStats(identifier: string, config?: Partial<RateLimitConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}:${identifier}`;

    try {
      const now = Date.now();
      const windowStart = now - finalConfig.windowMs;

      const pipeline = this.redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);
      pipeline.ttl(key);

      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis事务执行失败');
      }

      const currentRequests = results[1][1] as number;
      const ttl = results[2][1] as number;

      return {
        currentRequests,
        maxRequests: finalConfig.maxRequests,
        remaining: Math.max(0, finalConfig.maxRequests - currentRequests),
        windowMs: finalConfig.windowMs,
        resetTime: Date.now() + (ttl * 1000),
      };
    } catch (error) {
      console.error('Get rate limit stats failed:', error);
      return null;
    }
  }

  /**
   * 清除某个标识符的限流记录
   */
  async clearRateLimit(identifier: string, config?: Partial<RateLimitConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}:${identifier}`;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Clear rate limit failed:', error);
      return false;
    }
  }

  /**
   * 预定义的限流配置
   */
  getPredefinedConfigs() {
    return {
      // 登录接口限流：5分钟内最多5次
      login: {
        windowMs: 5 * 60 * 1000, // 5分钟
        maxRequests: 5,
        keyPrefix: 'login_limit',
        message: '登录尝试次数过多，请5分钟后再试',
      },
      
      // 注册接口限流：1小时内最多3次
      register: {
        windowMs: 60 * 60 * 1000, // 1小时
        maxRequests: 3,
        keyPrefix: 'register_limit',
        message: '注册次数过多，请1小时后再试',
      },
      
      // 短信验证码限流：1分钟内最多1次
      sms: {
        windowMs: 60 * 1000, // 1分钟
        maxRequests: 1,
        keyPrefix: 'sms_limit',
        message: '验证码发送过于频繁，请1分钟后再试',
      },
      
      // API接口通用限流：1分钟内最多60次
      api: {
        windowMs: 60 * 1000, // 1分钟
        maxRequests: 60,
        keyPrefix: 'api_limit',
        message: 'API调用过于频繁，请稍后再试',
      },
    };
  }

  /**
   * 关闭Redis连接
   */
  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}