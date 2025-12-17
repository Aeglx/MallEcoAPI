import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MallLogistics } from '../entities/logistics.entity';
import { Traces } from '../entities/traces.vo';
import { LogisticsPlugin } from '../interfaces/logistics-plugin.interface';
import { CreateLogisticsDto } from '../dto/create-logistics.dto';
import { LabelOrderDTO } from '../dto/label-order.dto';

@Injectable()
export class LogisticsService {
  private readonly logisticsPlugins: Map<string, LogisticsPlugin> = new Map();

  constructor(
    @InjectRepository(MallLogistics)
    private readonly logisticsRepository: Repository<MallLogistics>,
  ) {}

  /**
   * 注册物流插件
   * @param plugin 物流插件实例
   */
  registerPlugin(plugin: LogisticsPlugin): void {
    const pluginName = plugin.pluginName();
    this.logisticsPlugins.set(pluginName, plugin);
  }

  /**
   * 获取物流插件
   * @param pluginName 插件名称
   */
  getPlugin(pluginName: string): LogisticsPlugin {
    const plugin = this.logisticsPlugins.get(pluginName);
    if (!plugin) {
      throw new NotFoundException(`Logistics plugin ${pluginName} not found`);
    }
    return plugin;
  }

  /**
   * 创建物流信息
   * @param createLogisticsDto 创建物流信息DTO
   */
  async createLogistics(createLogisticsDto: CreateLogisticsDto): Promise<MallLogistics> {
    const logistics = this.logisticsRepository.create(createLogisticsDto);
    return await this.logisticsRepository.save(logistics);
  }

  /**
   * 查询物流信息
   * @param logisticsId 物流ID
   * @param expNo 运单号
   * @param phone 手机号
   */
  async pollQuery(logisticsId: string, expNo: string, phone?: string): Promise<Traces> {
    const logistics = await this.logisticsRepository.findOneBy({ id: logisticsId });
    if (!logistics) {
      throw new NotFoundException('Logistics not found');
    }

    const plugin = this.getPlugin(logistics.pluginName);
    return await plugin.pollQuery(logistics, expNo, phone);
  }

  /**
   * 查询物流地图轨迹
   * @param logisticsId 物流ID
   * @param expNo 运单号
   * @param phone 手机号
   * @param from 出发地
   * @param to 目的地
   */
  async pollMapTrack(logisticsId: string, expNo: string, phone?: string, from?: string, to?: string): Promise<Traces> {
    const logistics = await this.logisticsRepository.findOneBy({ id: logisticsId });
    if (!logistics) {
      throw new NotFoundException('Logistics not found');
    }

    const plugin = this.getPlugin(logistics.pluginName);
    return await plugin.pollMapTrack(logistics, expNo, phone, from, to);
  }

  /**
   * 打印电子面单
   * @param logisticsId 物流ID
   * @param labelOrderDTO 电子面单打印DTO
   */
  async labelOrder(logisticsId: string, labelOrderDTO: LabelOrderDTO): Promise<Map<string, any>> {
    const logistics = await this.logisticsRepository.findOneBy({ id: logisticsId });
    if (!logistics) {
      throw new NotFoundException('Logistics not found');
    }

    const plugin = this.getPlugin(logistics.pluginName);
    return await plugin.labelOrder(labelOrderDTO);
  }

  /**
   * 创建物流订单
   * @param logisticsId 物流ID
   * @param orderDetailVO 订单详情VO
   */
  async createOrder(logisticsId: string, orderDetailVO: any): Promise<string> {
    const logistics = await this.logisticsRepository.findOneBy({ id: logisticsId });
    if (!logistics) {
      throw new NotFoundException('Logistics not found');
    }

    const plugin = this.getPlugin(logistics.pluginName);
    return await plugin.createOrder(orderDetailVO);
  }

  /**
   * 获取所有物流信息
   */
  async findAllLogistics(): Promise<MallLogistics[]> {
    return await this.logisticsRepository.find();
  }

  /**
   * 根据ID获取物流信息
   * @param id 物流ID
   */
  async findLogisticsById(id: string): Promise<MallLogistics> {
    const logistics = await this.logisticsRepository.findOneBy({ id });
    if (!logistics) {
      throw new NotFoundException('Logistics not found');
    }
    return logistics;
  }

  /**
   * 更新物流信息
   * @param id 物流ID
   * @param updateLogisticsDto 更新物流信息DTO
   */
  async updateLogistics(id: string, updateLogisticsDto: any): Promise<MallLogistics> {
    const logistics = await this.findLogisticsById(id);
    Object.assign(logistics, updateLogisticsDto);
    return await this.logisticsRepository.save(logistics);
  }

  /**
   * 删除物流信息
   * @param id 物流ID
   */
  async deleteLogistics(id: string): Promise<void> {
    const result = await this.logisticsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Logistics not found');
    }
  }
}