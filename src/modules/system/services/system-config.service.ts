import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SystemConfigEntity } from '../entities/system-config.entity';
import { CreateSystemConfigDto } from '../dto/create-system-config.dto';
import { UpdateSystemConfigDto } from '../dto/update-system-config.dto';
import { SystemConfigSearchDto } from '../dto/system-config-search.dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfigEntity)
    private readonly configRepository: Repository<SystemConfigEntity>,
  ) {}

  /**
   * 创建系统配置
   */
  async create(createDto: CreateSystemConfigDto): Promise<SystemConfigEntity> {
    // 检查配置键是否已存在
    const existingConfig = await this.configRepository.findOne({
      where: { configKey: createDto.configKey }
    });
    
    if (existingConfig) {
      throw new Error('配置键名已存在');
    }

    const config = this.configRepository.create(createDto);
    return await this.configRepository.save(config);
  }

  /**
   * 查询系统配置列表
   */
  async findAll(searchDto: SystemConfigSearchDto): Promise<{
    list: SystemConfigEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { configKey, configGroup, description, page, limit } = searchDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (configKey) {
      where.configKey = Like(`%${configKey}%`);
    }
    
    if (configGroup) {
      where.configGroup = configGroup;
    }
    
    if (description) {
      where.description = Like(`%${description}%`);
    }

    const [list, total] = await this.configRepository.findAndCount({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      list,
      total,
      page,
      limit
    };
  }

  /**
   * 根据ID查询配置
   */
  async findOne(id: number): Promise<SystemConfigEntity> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('配置不存在');
    }
    return config;
  }

  /**
   * 根据键名查询配置
   */
  async findByKey(configKey: string): Promise<SystemConfigEntity> {
    const config = await this.configRepository.findOne({ where: { configKey } });
    if (!config) {
      throw new NotFoundException('配置不存在');
    }
    return config;
  }

  /**
   * 更新系统配置
   */
  async update(id: number, updateDto: UpdateSystemConfigDto): Promise<SystemConfigEntity> {
    const config = await this.findOne(id);
    
    // 检查是否允许修改
    if (!config.editable) {
      throw new Error('该配置不允许修改');
    }

    // 如果修改了配置键名，检查是否重复
    if (updateDto.configKey && updateDto.configKey !== config.configKey) {
      const existingConfig = await this.configRepository.findOne({
        where: { configKey: updateDto.configKey }
      });
      
      if (existingConfig) {
        throw new Error('配置键名已存在');
      }
    }

    Object.assign(config, updateDto);
    return await this.configRepository.save(config);
  }

  /**
   * 删除系统配置
   */
  async remove(id: number): Promise<void> {
    const config = await this.findOne(id);
    
    // 检查是否允许删除
    if (!config.editable) {
      throw new Error('该配置不允许删除');
    }

    await this.configRepository.remove(config);
  }

  /**
   * 批量获取配置值
   */
  async getConfigValues(keys: string[]): Promise<Record<string, any>> {
    const configs = await this.configRepository.find({
      where: keys.map(key => ({ configKey: key }))
    });

    const result: Record<string, any> = {};
    configs.forEach(config => {
      // 根据配置类型转换值
      switch (config.configType) {
        case 'number':
          result[config.configKey] = Number(config.configValue);
          break;
        case 'boolean':
          result[config.configKey] = config.configValue === 'true';
          break;
        case 'json':
          result[config.configKey] = JSON.parse(config.configValue);
          break;
        default:
          result[config.configKey] = config.configValue;
      }
    });

    return result;
  }

  /**
   * 获取配置分组列表
   */
  async getConfigGroups(): Promise<string[]> {
    const groups = await this.configRepository
      .createQueryBuilder('config')
      .select('DISTINCT config.configGroup', 'configGroup')
      .orderBy('config.configGroup', 'ASC')
      .getRawMany();

    return groups.map(item => item.configGroup);
  }

  /**
   * 获取配置摘要信息
   */
  async getConfigSummary(): Promise<{
    totalConfigs: number;
    totalGroups: number;
    activeConfigs: number;
  }> {
    // 获取配置总数
    const totalConfigs = await this.configRepository.count();
    
    // 获取配置分组数
    const groups = await this.getConfigGroups();
    const totalGroups = groups.length;
    
    // 获取活跃配置数（假设active为true表示活跃）
    const activeConfigs = await this.configRepository.count({ where: { active: true } });

    return {
      totalConfigs,
      totalGroups,
      activeConfigs,
    };
  }
}