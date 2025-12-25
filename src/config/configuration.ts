import { registerAs } from '@nestjs/config';

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  charset: string;
  synchronize: boolean;
  logging: boolean;
  connectionLimit: number;
}

/**
 * 服务器配置接口
 */
export interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  ttl: number;
  max: number;
  store: 'memory' | 'redis';
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}

/**
 * 安全配置接口
 */
export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  database: DatabaseConfig;
  server: ServerConfig;
  cache: CacheConfig;
  security: SecurityConfig;
}

// 数据库配置
const databaseConfig = registerAs<DatabaseConfig>('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'malleco',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
}));

// 服务器配置
const serverConfig = registerAs<ServerConfig>('server', () => ({
  port: parseInt(process.env.PORT || '9000', 10),
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:9000', 'http://localhost:10000', 'http://localhost:10002', 'http://localhost:10003'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
}));

// 缓存配置
const cacheConfig = registerAs<CacheConfig>('cache', () => ({
  ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  max: parseInt(process.env.CACHE_MAX || '100', 10),
  store: (process.env.CACHE_STORE as 'memory' | 'redis') || 'memory',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
}));

// 安全配置
const securityConfig = registerAs<SecurityConfig>('security', () => ({
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
}));

// WebSocket配置
import websocketConfig from './websocket.config';

export const configurations = [
  databaseConfig,
  serverConfig,
  cacheConfig,
  securityConfig,
  websocketConfig,
];

export default {
  database: databaseConfig,
  server: serverConfig,
  cache: cacheConfig,
  security: securityConfig,
  websocket: websocketConfig,
};