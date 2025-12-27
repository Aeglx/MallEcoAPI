/**
 * 数据库配置
 * 支持自动检测和初始化功能
 */

import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsNotEmpty, Min, Max } from 'class-validator';
import { DatabaseManager } from '../../DB';

/**
 * 数据库配置接口
 */
export interface DatabaseConfigInterface {
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
 * 数据库配置验证类
 */
export class DatabaseConfigValidation {
  @IsString()
  @IsNotEmpty()
  host!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsNotEmpty()
  database!: string;

  @IsBoolean()
  synchronize!: boolean;

  @IsBoolean()
  logging!: boolean;
}

/**
 * 数据库配置（使用registerAs）
 */
export const databaseConfigRegister = registerAs<DatabaseConfigInterface>('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'malleco',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
}));

@Injectable()
export class DatabaseConfig {
  private readonly dbChecker: DatabaseManager;

  constructor() {
    this.dbChecker = new DatabaseManager();
  }

  /**
   * 应用启动时自动检测数据库
   */
  async autoCheckDatabase(): Promise<void> {
    console.log('🔍 MallEco API 启动中...');

    try {
      // 检测数据库状态
      const result = await this.dbChecker.checkConnection();

      if (result) {
        console.log('✅ 数据库检测完成，API服务正常启动');
      } else {
        console.error('❌ 数据库检测失败，请检查数据库配置');
        process.exit(1);
      }
    } catch (error) {
      console.error('数据库检测过程中发生错误:', error.message);

      // 开发环境下可以选择继续运行
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  开发环境：忽略数据库错误，继续启动');
        return;
      }

      process.exit(1);
    }
  }

  /**
   * 获取数据库连接配置
   */
  getConnectionConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'malleco',
      charset: 'utf8mb4',
      timezone: '+08:00',
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      connectionLimit: 10,
    };
  }

  /**
   * 获取数据库健康状态
   */
  async getHealthStatus() {
    return await this.dbChecker.checkConnection();
  }

  /**
   * 获取数据库信息
   */
  async getDatabaseInfo() {
    return await this.dbChecker.getDatabaseInfo();
  }
}

// 导出配置实例
export const databaseConfig = new DatabaseConfig();
