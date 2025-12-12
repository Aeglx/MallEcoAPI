import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GlobalConfigService implements OnModuleInit {
  constructor(
    private readonly nestConfigService: NestConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    // 初始化默认配置
    // 移除对 ManagerConfigService 的依赖
  }

  /**
   * 获取环境变量配置
   */
  getEnv<T = string>(key: string, defaultValue?: T): T {
    return this.nestConfigService.get<T>(key, defaultValue);
  }

  /**
   * 获取系统配置
   */
  async getConfig<T = string>(key: string, defaultValue?: T): Promise<T> {
    // 暂时只从环境变量获取配置
    const value = this.nestConfigService.get<T>(key);
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Config ${key} not found`);
    }
    return value;
  }

  /**
   * 获取系统配置（带类型转换）
   */
  async getConfigValueByType<T>(
    key: string,
    type: 'string' | 'number' | 'boolean' | 'json' = 'string',
    defaultValue?: T,
  ): Promise<T> {
    try {
      const value = this.nestConfigService.get<string>(key);
      if (value === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Config ${key} not found`);
      }

      switch (type) {
        case 'number':
          return Number(value) as unknown as T;
        case 'boolean':
          return (value.toLowerCase() === 'true' || value === '1') as unknown as T;
        case 'json':
          return JSON.parse(value) as unknown as T;
        default:
          return value as unknown as T;
      }
    } catch (error) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * 批量获取系统配置
   */
  async getBatchConfigs(keys: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    keys.forEach(key => {
      const value = this.nestConfigService.get<string>(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    });
    return result;
  }

  /**
   * 刷新配置缓存
   */
  async refreshCache(): Promise<void> {
    // 移除对 ManagerConfigService 的依赖
    // 触发配置刷新事件
    this.eventEmitter.emit('config.refresh');
  }

  /**
   * 监听配置变化
   */
  async onChange(key: string, callback: (value: string | null) => void): Promise<void> {
    // 注册配置变更监听器
    this.eventEmitter.on(`config.change.${key}`, callback);
  }
}
