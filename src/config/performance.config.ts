import { registerAs } from '@nestjs/config';

export default registerAs('performance', () => ({
  // API性能监控配置
  api: {
    slowThreshold: parseInt(process.env.API_SLOW_THRESHOLD || '1000'), // 慢接口阈值(ms)
    sampleRate: parseFloat(process.env.API_SAMPLE_RATE || '1.0'), // 采样率
    maxResponseTime: parseInt(process.env.API_MAX_RESPONSE_TIME || '30000'), // 最大响应时间
  },

  // 数据库性能配置
  database: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20'),
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '50'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
    reapInterval: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
  },

  // Redis缓存配置
  redis: {
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000'),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST || '3'),
    lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
  },

  // 缓存策略配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 默认缓存时间(秒)
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '10000'), // 最大缓存项数
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600'), // 清理周期(秒)

    // 不同业务模块的缓存配置
    modules: {
      product: {
        ttl: 3600, // 商品缓存1小时
        maxSize: 5000,
      },
      user: {
        ttl: 1800, // 用户信息缓存30分钟
        maxSize: 10000,
      },
      order: {
        ttl: 900, // 订单缓存15分钟
        maxSize: 2000,
      },
    },
  },

  // 请求限制配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 时间窗口(ms)
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 最大请求数

    // 不同接口的限流配置
    endpoints: {
      auth: { max: 100 }, // 认证接口限流
      order: { max: 500 }, // 订单接口限流
      payment: { max: 300 }, // 支付接口限流
      search: { max: 2000 }, // 搜索接口限流
    },
  },

  // 压缩配置
  compression: {
    threshold: process.env.COMPRESSION_THRESHOLD || '1kb',
    level: parseInt(process.env.COMPRESSION_LEVEL || '6'),
  },

  // 监控和告警配置
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '30000'),
    alertThreshold: {
      cpu: parseFloat(process.env.ALERT_CPU_THRESHOLD || '80'),
      memory: parseFloat(process.env.ALERT_MEMORY_THRESHOLD || '85'),
      responseTime: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD || '2000'),
    },
  },
}));
