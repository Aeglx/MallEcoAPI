import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService as ManagerConfigService } from '../../modules/manager/config/config.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GlobalConfigService implements OnModuleInit {
  constructor(
    private readonly nestConfigService: NestConfigService,
    @Inject(forwardRef(() => ManagerConfigService))
    private readonly managerConfigService: ManagerConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    // 初始化默认配置
    await this.managerConfigService.initDefaultConfig();
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
    const value = await this.managerConfigService.getConfigValue(key);
    if (value === null) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Config ${key} not found`);
    }
    return value as unknown as T;
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
      return await this.managerConfigService.getConfigValueByType<T>(key, type);
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
    return await this.managerConfigService.getBatchConfigValues(keys);
  }

  /**
   * 刷新配置缓存
   */
  async refreshCache(): Promise<void> {
    await this.managerConfigService.refreshCache();
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
