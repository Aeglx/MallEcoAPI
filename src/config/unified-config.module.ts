import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import appConfig from './app.config';
import { databaseConfigRegister as databaseConfig } from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import websocketConfig from './websocket.config';
import performanceConfig from './performance.config';
import { throttlerConfig } from './rate-limit.config';

/**
 * 配置验证函数
 */
function validate(config: Record<string, unknown>) {
  // 这里可以添加全局配置验证逻辑
  // 例如检查必需的环境变量
  
  const requiredEnvVars = [
    'JWT_SECRET',
    // 可以根据需要添加更多必需的环境变量
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName] === 'your-secret-key',
  );

  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `缺少必需的环境变量: ${missingVars.join(', ')}。请在生产环境中配置这些变量。`,
    );
  }

  return config;
}

/**
 * 统一配置模块
 * 集中管理所有配置，提供类型安全的配置访问
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE_PATH || 'config/.env',
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        websocketConfig,
        performanceConfig,
      ],
      validate,
      cache: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class UnifiedConfigModule {}

