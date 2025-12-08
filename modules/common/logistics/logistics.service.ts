import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logistics, LogisticsCompany, LogisticsStatus } from './entities/logistics.entity';
import { LogisticsLog, LogisticsOperateType } from './entities/logistics-log.entity';
import { CreateLogisticsDto } from './dto/create-logistics.dto';
import { UpdateLogisticsDto } from './dto/update-logistics.dto';
import { OrderService } from '../order/order.service';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Logistics) private logisticsRepository: Repository<Logistics>,
    @InjectRepository(LogisticsLog) private logisticsLogRepository: Repository<LogisticsLog>,
    private orderService: OrderService,
  ) {}

  /**
   * 创建物流记录
   * @param createLogisticsDto 创建物流记录DTO
   * @param operatorInfo 操作人信息
   * @returns 创建的物流记录
   */
  async create(createLogisticsDto: CreateLogisticsDto, operatorInfo: { id: string; name: string }): Promise<Logistics> {
    // 检查订单是否存在
    const order = await this.orderService.findOne(createLogisticsDto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${createLogisticsDto.orderId} not found`);
    }

    // 创建物流记录
    const logistics = this.logisticsRepository.create({
      ...createLogisticsDto,
      logisticsStatus: createLogisticsDto.logisticsStatus || LogisticsStatus.NOT_SEND,
    });

    const savedLogistics = await this.logisticsRepository.save(logistics);

    // 创建物流日志
    await this.createLogisticsLog({
      logisticsId: savedLogistics.id,
      orderId: savedLogistics.orderId,
      operateType: LogisticsOperateType.CREATE,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: null,
      newStatus: savedLogistics.logisticsStatus,
      remark: '创建物流记录',
    });

    // 如果物流状态为已发货，更新订单状态
    if (savedLogistics.logisticsStatus === LogisticsStatus.DELIVERING) {
      await this.orderService.updateShippingStatus(savedLogistics.orderId, savedLogistics.logisticsStatus);
    }

    return savedLogistics;
  }

  /**
   * 查询物流记录列表
   * @returns 物流记录列表
   */
  async findAll(): Promise<Logistics[]> {
    return await this.logisticsRepository.find({
      relations: ['logisticsLogs'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据ID查询物流记录
   * @param id 物流记录ID
   * @returns 物流记录
   */
  async findOne(id: string): Promise<Logistics> {
    const logistics = await this.logisticsRepository.findOne({
      where: { id },
      relations: ['logisticsLogs'],
    });
    if (!logistics) {
      throw new NotFoundException(`Logistics with ID ${id} not found`);
    }
    return logistics;
  }

  /**
   * 根据订单ID查询物流记录
   * @param orderId 订单ID
   * @returns 物流记录
   */
  async findByOrderId(orderId: string): Promise<Logistics> {
    const logistics = await this.logisticsRepository.findOne({
      where: { orderId },
      relations: ['logisticsLogs'],
    });
    if (!logistics) {
      throw new NotFoundException(`Logistics for order ${orderId} not found`);
    }
    return logistics;
  }

  /**
   * 根据物流单号查询物流记录
   * @param logisticsNo 物流单号
   * @returns 物流记录
   */
  async findByLogisticsNo(logisticsNo: string): Promise<Logistics> {
    const logistics = await this.logisticsRepository.findOne({
      where: { logisticsNo },
      relations: ['logisticsLogs'],
    });
    if (!logistics) {
      throw new NotFoundException(`Logistics with number ${logisticsNo} not found`);
    }
    return logistics;
  }

  /**
   * 更新物流记录
   * @param id 物流记录ID
   * @param updateLogisticsDto 更新物流记录DTO
   * @param operatorInfo 操作人信息
   * @returns 更新后的物流记录
   */
  async update(id: string, updateLogisticsDto: UpdateLogisticsDto, operatorInfo: { id: string; name: string }): Promise<Logistics> {
    const logistics = await this.findOne(id);

    const oldStatus = logistics.logisticsStatus;
    let statusChanged = false;

    // 更新物流记录信息
    Object.assign(logistics, updateLogisticsDto);

    if (updateLogisticsDto.logisticsStatus && updateLogisticsDto.logisticsStatus !== oldStatus) {
      statusChanged = true;
    }

    const savedLogistics = await this.logisticsRepository.save(logistics);

    // 创建物流日志
    await this.createLogisticsLog({
      logisticsId: savedLogistics.id,
      orderId: savedLogistics.orderId,
      operateType: LogisticsOperateType.UPDATE_INFO,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: oldStatus,
      newStatus: savedLogistics.logisticsStatus,
      remark: '更新物流信息',
    });

    // 如果物流状态改变，更新订单状态
    if (statusChanged) {
      await this.orderService.updateShippingStatus(savedLogistics.orderId, savedLogistics.logisticsStatus);
    }

    return savedLogistics;
  }

  /**
   * 删除物流记录
   * @param id 物流记录ID
   * @returns 删除结果
   */
  async remove(id: string, operatorInfo: { id: string; name: string }): Promise<void> {
    const logistics = await this.findOne(id);

    // 创建物流日志
    await this.createLogisticsLog({
      logisticsId: logistics.id,
      orderId: logistics.orderId,
      operateType: LogisticsOperateType.CANCEL,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: logistics.logisticsStatus,
      newStatus: null,
      remark: '删除物流记录',
    });

    await this.logisticsRepository.remove(logistics);
  }

  /**
   * 更新物流状态
   * @param id 物流记录ID
   * @param logisticsStatus 物流状态
   * @param trackingInfo 物流追踪信息
   * @param operatorInfo 操作人信息
   * @returns 更新后的物流记录
   */
  async updateStatus(id: string, logisticsStatus: LogisticsStatus, trackingInfo: string, operatorInfo: { id: string; name: string }): Promise<Logistics> {
    const logistics = await this.findOne(id);

    const oldStatus = logistics.logisticsStatus;

    // 更新物流状态
    logistics.logisticsStatus = logisticsStatus;

    // 如果是已收货状态，更新实际送达时间
    if (logisticsStatus === LogisticsStatus.RECEIVED) {
      logistics.actualDeliveryTime = new Date();
    }

    const savedLogistics = await this.logisticsRepository.save(logistics);

    // 创建物流日志
    await this.createLogisticsLog({
      logisticsId: savedLogistics.id,
      orderId: savedLogistics.orderId,
      operateType: LogisticsOperateType.UPDATE_STATUS,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: oldStatus,
      newStatus: savedLogistics.logisticsStatus,
      trackingInfo: trackingInfo,
      remark: `更新物流状态: ${oldStatus} -> ${savedLogistics.logisticsStatus}`,
    });

    // 更新订单状态
    await this.orderService.updateShippingStatus(savedLogistics.orderId, savedLogistics.logisticsStatus);

    return savedLogistics;
  }

  /**
   * 模拟物流轨迹更新
   * @param logisticsNo 物流单号
   * @param logisticsStatus 物流状态
   * @param trackingInfo 物流追踪信息
   * @returns 更新后的物流记录
   */
  async simulateTracking(logisticsNo: string, logisticsStatus: LogisticsStatus, trackingInfo: string): Promise<Logistics> {
    const logistics = await this.findByLogisticsNo(logisticsNo);

    const oldStatus = logistics.logisticsStatus;

    // 更新物流状态
    logistics.logisticsStatus = logisticsStatus;

    // 如果是已收货状态，更新实际送达时间
    if (logisticsStatus === LogisticsStatus.RECEIVED) {
      logistics.actualDeliveryTime = new Date();
    }

    const savedLogistics = await this.logisticsRepository.save(logistics);

    // 创建物流日志
    await this.createLogisticsLog({
      logisticsId: savedLogistics.id,
      orderId: savedLogistics.orderId,
      operateType: LogisticsOperateType.UPDATE_STATUS,
      operateId: 'system',
      operateName: '系统',
      oldStatus: oldStatus,
      newStatus: savedLogistics.logisticsStatus,
      trackingInfo: trackingInfo,
      remark: '系统模拟更新物流状态',
    });

    // 更新订单状态
    await this.orderService.updateShippingStatus(savedLogistics.orderId, savedLogistics.logisticsStatus);

    return savedLogistics;
  }

  /**
   * 创建物流日志
   * @param logData 日志数据
   * @returns 创建的物流日志
   */
  private async createLogisticsLog(logData: {
    logisticsId: string;
    orderId: string;
    operateType: LogisticsOperateType;
    operateId: string;
    operateName: string;
    oldStatus: number | null;
    newStatus: number | null;
    trackingInfo?: string;
    remark: string;
  }): Promise<LogisticsLog> {
    const log = this.logisticsLogRepository.create({
      ...logData,
      operateTime: new Date(),
    });

    return await this.logisticsLogRepository.save(log);
  }

  /**
   * 根据订单ID查询物流记录（如果不存在则返回null）
   * @param orderId 订单ID
   * @returns 物流记录或null
   */
  async findByOrderIdOrNull(orderId: string): Promise<Logistics | null> {
    return await this.logisticsRepository.findOne({
      where: { orderId },
      relations: ['logisticsLogs'],
    });
  }
}
