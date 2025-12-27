import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * API限流配置
 */
export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: parseInt(process.env.RATE_LIMIT_SHORT_TTL || '1000', 10), // 1秒
      limit: parseInt(process.env.RATE_LIMIT_SHORT_LIMIT || '3', 10), // 3次
    },
    {
      name: 'medium',
      ttl: parseInt(process.env.RATE_LIMIT_MEDIUM_TTL || '10000', 10), // 10秒
      limit: parseInt(process.env.RATE_LIMIT_MEDIUM_LIMIT || '20', 10), // 20次
    },
    {
      name: 'long',
      ttl: parseInt(process.env.RATE_LIMIT_LONG_TTL || '60000', 10), // 1分钟
      limit: parseInt(process.env.RATE_LIMIT_LONG_LIMIT || '100', 10), // 100次
    },
  ],
  // 注意：@nestjs/throttler 默认使用内存存储
  // 如需使用Redis，需要安装 @nestjs/throttler-storage-redis 并配置
  // storage: process.env.REDIS_HOST ? ... : undefined,
};

/**
 * 接口限流配置映射
 * 可以根据路由配置不同的限流策略
 */
export const throttlerRouteConfig: Record<string, { ttl: number; limit: number }> = {
  // 登录接口 - 严格限流
  'POST /modules/auth/login': { ttl: 60000, limit: 5 },
  'POST /modules/auth/register': { ttl: 60000, limit: 3 },

  // 支付接口
  'POST /modules/payment/*': { ttl: 60000, limit: 10 },

  // 下单接口
  'POST /modules/orders/create': { ttl: 60000, limit: 10 },

  // 搜索接口 - 较宽松
  'GET /modules/goods/search': { ttl: 10000, limit: 100 },
  'GET /modules/common/*': { ttl: 10000, limit: 100 },

  // 验证码接口
  'GET /modules/common/sms/*': { ttl: 60000, limit: 10 },
  'POST /modules/common/sms/*': { ttl: 60000, limit: 10 },

  // WebSocket连接
  'GET /im': { ttl: 60000, limit: 20 },
};

/**
 * 限流白名单（IP或用户ID）
 */
export const rateLimitWhitelist: string[] = [
  '127.0.0.1',
  '::1',
  // 可以添加更多白名单IP
];
