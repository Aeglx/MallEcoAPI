import { registerAs } from '@nestjs/config';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * JWT配置接口
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret?: string;
  refreshExpiresIn?: string;
}

/**
 * JWT配置验证类
 */
export class JwtConfigValidation {
  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_SECRET长度至少32个字符' })
  secret!: string;

  @IsString()
  @IsNotEmpty()
  expiresIn!: string;
}

/**
 * JWT配置
 */
export default registerAs<JwtConfig>('jwt', () => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

  if (secret === 'your-secret-key-change-this-in-production') {
    console.warn('⚠️  警告: 使用默认JWT密钥，生产环境请修改JWT_SECRET');
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  };
});
