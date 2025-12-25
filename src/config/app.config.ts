import { registerAs } from '@nestjs/config';
import { IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';

/**
 * 应用环境类型
 */
export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  name: string;
  version: string;
  port: number;
  nodeEnv: NodeEnv;
  apiPrefix: string;
  globalPrefix?: string;
}

/**
 * 应用配置验证类
 */
export class AppConfigValidation {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsEnum(NodeEnv)
  nodeEnv!: NodeEnv;
}

/**
 * 应用配置
 */
export default registerAs<AppConfig>('app', () => ({
  name: process.env.APP_NAME || 'MallEcoAPI',
  version: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT || '9000', 10),
  nodeEnv: (process.env.NODE_ENV as NodeEnv) || NodeEnv.DEVELOPMENT,
  apiPrefix: process.env.API_PREFIX || '/api',
  globalPrefix: process.env.GLOBAL_PREFIX,
}));

