import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConfigService {
  // 配置缓存
  private configCache: Map<string, Config> = new Map();

  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // 初始化缓存
    this.loadCache();
  }

  // 加载所有配置到缓存
  private async loadCache(): Promise<void> {
    const configs = await this.configRepository.find();
    configs.forEach(config => {
      this.configCache.set(config.key, config);
    });
  }

  // 刷新缓存
  async refreshCache(): Promise<void> {
    this.configCache.clear();
    await this.loadCache();
  }

  async create(createConfigDto: CreateConfigDto): Promise<Config> {
    const config = this.configRepository.create(createConfigDto);
    const savedConfig = await this.configRepository.save(config);
    // 更新缓存
    this.configCache.set(savedConfig.key, savedConfig);
    // 触发配置创建事件
    this.eventEmitter.emit('config.create', savedConfig);
    return savedConfig;
  }

  async findAll(): Promise<Config[]> {
    return await this.configRepository.find();
  }

  async findByGroup(group: string): Promise<Config[]> {
    return await this.configRepository.find({ where: { group } });
  }

  async findOne(id: string): Promise<Config> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(`Config with id ${id} not found`);
    }
    return config;
  }

  async findOneByKey(key: string): Promise<Config> {
    // 先从缓存获取
    let config = this.configCache.get(key);
    if (!config) {
      // 缓存不存在则从数据库获取
      config = await this.configRepository.findOne({ where: { key } });
      if (!config) {
        throw new NotFoundException(`Config with key ${key} not found`);
      }
      // 更新缓存
      this.configCache.set(key, config);
    }
    return config;
  }

  async update(id: string, updateConfigDto: UpdateConfigDto): Promise<Config> {
    const config = await this.findOne(id);
    Object.assign(config, updateConfigDto);
    const updatedConfig = await this.configRepository.save(config);
    // 更新缓存
    this.configCache.set(updatedConfig.key, updatedConfig);
    // 触发配置更新事件
    this.eventEmitter.emit('config.update', updatedConfig);
    return updatedConfig;
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    const result = await this.configRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Config with id ${id} not found`);
    }
    // 从缓存移除
    this.configCache.delete(config.key);
    // 触发配置删除事件
    this.eventEmitter.emit('config.delete', config);
  }

  async getConfigValue(key: string): Promise<string | null> {
    try {
      const config = await this.findOneByKey(key);
      return config.value;
    } catch (error) {
      return null;
    }
  }

  async getConfigValueByType<T>(key: string, type: 'string' | 'number' | 'boolean' | 'json' = 'string'): Promise<T | null> {
    const value = await this.getConfigValue(key);
    if (value === null) {
      return null;
    }

    switch (type) {
      case 'number':
        return Number(value) as T;
      case 'boolean':
        return (value.toLowerCase() === 'true' || value === '1') as T;
      case 'json':
        return JSON.parse(value) as T;
      default:
        return value as T;
    }
  }

  // 批量获取配置
  async getBatchConfigValues(keys: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    for (const key of keys) {
      const value = await this.getConfigValue(key);
      result.set(key, value || '');
    }
    return result;
  }

  // 初始化默认配置
  async initDefaultConfig(): Promise<void> {
    const defaultConfig = [
      {
        key: 'system.name',
        value: 'MallEco',
        description: '系统名称',
        type: 'string',
        enabled: true,
        group: 'system',
      },
      {
        key: 'system.version',
        value: '1.0.0',
        description: '系统版本',
        type: 'string',
        enabled: true,
        group: 'system',
      },
      {
        key: 'system.debug',
        value: 'true',
        description: '调试模式',
        type: 'boolean',
        enabled: true,
        group: 'system',
      },
      {
        key: 'system.cors.enabled',
        value: 'true',
        description: '是否启用CORS',
        type: 'boolean',
        enabled: true,
        group: 'system',
      },
      {
        key: 'log.level',
        value: 'info',
        description: '日志级别',
        type: 'string',
        enabled: true,
        group: 'log',
      },
      {
        key: 'log.maxSize',
        value: '10MB',
        description: '日志文件最大大小',
        type: 'string',
        enabled: true,
        group: 'log',
      },
    ];

    // 批量插入或更新默认配置
    for (const configData of defaultConfig) {
      const existingConfig = await this.configRepository.findOne({ where: { key: configData.key } });
      if (existingConfig) {
        // 更新已存在的配置
        await this.configRepository.update(existingConfig.id, configData);
      } else {
        // 创建新配置
        const config = this.configRepository.create(configData);
        await this.configRepository.save(config);
      }
    }

    // 刷新缓存
    await this.refreshCache();
  }
}
