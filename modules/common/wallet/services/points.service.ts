import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Points, PointsRecord } from '../entities/points.entity';
import { PointsGoods, PointsExchange } from '../entities/points-goods.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Points)
    private pointsRepository: Repository<Points>,
    @InjectRepository(PointsRecord)
    private pointsRecordRepository: Repository<PointsRecord>,
    @InjectRepository(PointsGoods)
    private pointsGoodsRepository: Repository<PointsGoods>,
    @InjectRepository(PointsExchange)
    private pointsExchangeRepository: Repository<PointsExchange>,
  ) {}

  /**
   * 获取会员积分信息
   */
  async getMemberPoints(memberId: string): Promise<Points> {
    let points = await this.pointsRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });

    if (!points) {
      // 如果没有积分记录，创建一个
      points = this.pointsRepository.create({
        memberId,
        memberName: '', // 应该从会员表获取
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        totalExpired: 0,
        yearEarned: 0,
        monthEarned: 0,
        level: 1,
      });

      points = await this.pointsRepository.save(points);
    }

    return points;
  }

  /**
   * 积分变动
   */
  async changePoints(params: {
    memberId: string;
    type: number;
    direction: number;
    points: number;
    expireTime?: Date;
    businessType?: string;
    businessId?: string;
    businessNo?: string;
    description?: string;
    operatorId?: string;
    operatorName?: string;
    remark?: string;
  }): Promise<PointsRecord> {
    const pointsInfo = await this.getMemberPoints(params.memberId);

    const beforeBalance = pointsInfo.balance;
    let afterBalance = beforeBalance;

    // 检查积分是否足够
    if (params.direction === 2 && beforeBalance < params.points) {
      throw new CustomException(CodeEnum.INSUFFICIENT_POINTS);
    }

    // 计算变动后余额
    switch (params.direction) {
      case 1: // 收入
        afterBalance = beforeBalance + params.points;
        break;
      case 2: // 支出
        afterBalance = beforeBalance - params.points;
        break;
    }

    // 更新积分信息
    await this.pointsRepository.update(
      { id: pointsInfo.id },
      {
        balance: afterBalance,
        // 更新累计数据
        ...(params.direction === 1 && { 
          totalEarned: pointsInfo.totalEarned + params.points,
          yearEarned: this.isCurrentYear(new Date()) ? pointsInfo.yearEarned + params.points : pointsInfo.yearEarned,
          monthEarned: this.isCurrentMonth(new Date()) ? pointsInfo.monthEarned + params.points : pointsInfo.monthEarned,
        }),
        ...(params.direction === 2 && { 
          totalSpent: pointsInfo.totalSpent + params.points 
        }),
        // 更新等级
        level: this.calculatePointsLevel(afterBalance),
        lastChangeTime: new Date(),
      }
    );

    // 创建积分流水记录
    const record = this.pointsRecordRepository.create({
      memberId: params.memberId,
      memberName: pointsInfo.memberName,
      type: params.type,
      direction: params.direction,
      points: params.points,
      beforeBalance,
      afterBalance,
      expireTime: params.expireTime,
      businessType: params.businessType,
      businessId: params.businessId,
      businessNo: params.businessNo,
      description: params.description,
      status: 0, // 有效
      operatorId: params.operatorId,
      operatorName: params.operatorName,
      remark: params.remark,
    });

    return await this.pointsRecordRepository.save(record);
  }

  /**
   * 获取积分流水记录
   */
  async getPointsRecords(params: {
    memberId?: string;
    type?: number;
    direction?: number;
    status?: number;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: PointsRecord[]; total: number }> {
    const { memberId, type, direction, status, startTime, endTime, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberId) {
      whereCondition.memberId = memberId;
    }

    if (type) {
      whereCondition.type = type;
    }

    if (direction) {
      whereCondition.direction = direction;
    }

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.pointsRecordRepository.findAndCount({
      where: whereCondition,
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 创建积分商品
   */
  async createPointsGoods(params: {
    productId: string;
    productName: string;
    productImage?: string;
    points: number;
    value: number;
    stock: number;
    limitCount: number;
    exchangeStartTime?: Date;
    exchangeEndTime?: Date;
    exchangeDescription?: string;
    description?: string;
    exchangeNotice?: string;
    remark?: string;
    createBy: string;
  }): Promise<PointsGoods> {
    // 检查商品是否已存在
    const existing = await this.pointsGoodsRepository.findOne({
      where: { productId: params.productId, deleteFlag: 0 }
    });

    if (existing) {
      throw new CustomException(CodeEnum.POINTS_GOODS_ALREADY_EXISTS);
    }

    const pointsGoods = this.pointsGoodsRepository.create({
      ...params,
      status: 1, // 上架
    });

    return await this.pointsGoodsRepository.save(pointsGoods);
  }

  /**
   * 获取积分商品列表
   */
  async getPointsGoodsList(params: {
    status?: number;
    isHot?: number;
    isRecommend?: number;
    pointsMin?: number;
    pointsMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: PointsGoods[]; total: number }> {
    const { status, isHot, isRecommend, pointsMin, pointsMax, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (isHot !== undefined) {
      whereCondition.isHot = isHot;
    }

    if (isRecommend !== undefined) {
      whereCondition.isRecommend = isRecommend;
    }

    if (pointsMin !== undefined && pointsMax !== undefined) {
      whereCondition.points = { $gte: pointsMin, $lte: pointsMax } as any;
    }

    const [items, total] = await this.pointsGoodsRepository.findAndCount({
      where: whereCondition,
      order: { sortOrder: 'ASC', createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取积分商品详情
   */
  async getPointsGoodsDetail(id: string): Promise<PointsGoods> {
    const pointsGoods = await this.pointsGoodsRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!pointsGoods) {
      throw new CustomException(CodeEnum.POINTS_GOODS_NOT_FOUND);
    }

    return pointsGoods;
  }

  /**
   * 积分兑换
   */
  async exchangePointsGoods(params: {
    memberId: string;
    memberName: string;
    pointsGoodsId: string;
    quantity?: number;
    shippingInfo?: any;
    remark?: string;
  }): Promise<PointsExchange> {
    const pointsGoods = await this.getPointsGoodsDetail(params.pointsGoodsId);

    // 检查商品状态
    if (pointsGoods.status !== 1) {
      throw new CustomException(CodeEnum.POINTS_GOODS_NOT_AVAILABLE);
    }

    // 检查兑换时间
    const now = new Date();
    if (pointsGoods.exchangeStartTime && now < pointsGoods.exchangeStartTime) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_NOT_STARTED);
    }

    if (pointsGoods.exchangeEndTime && now > pointsGoods.exchangeEndTime) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_ENDED);
    }

    // 检查库存
    if (pointsGoods.stock < (params.quantity || 1)) {
      throw new CustomException(CodeEnum.POINTS_GOODS_STOCK_INSUFFICIENT);
    }

    const quantity = params.quantity || 1;
    const totalPoints = pointsGoods.points * quantity;

    // 检查积分余额
    const memberPoints = await this.getMemberPoints(params.memberId);
    if (memberPoints.balance < totalPoints) {
      throw new CustomException(CodeEnum.INSUFFICIENT_POINTS);
    }

    // 检查限兑
    if (pointsGoods.limitCount > 0) {
      // 查询用户已兑换数量
      const exchangedCount = await this.pointsExchangeRepository.count({
        where: {
          memberId: params.memberId,
          pointsGoodsId: params.pointsGoodsId,
          status: { $ne: 4 } as any, // 排除已取消的
          deleteFlag: 0,
        }
      });

      if (exchangedCount + quantity > pointsGoods.limitCount) {
        throw new CustomException(CodeEnum.POINTS_EXCHANGE_LIMIT_EXCEEDED);
      }
    }

    // 生成兑换单号
    const exchangeNo = this.generateExchangeNo();

    // 扣除积分
    await this.changePoints({
      memberId: params.memberId,
      type: 4, // 兑换消费
      direction: 2, // 支出
      points: totalPoints,
      businessType: 'POINTS_EXCHANGE',
      businessId: pointsGoods.id,
      businessNo: exchangeNo,
      description: `兑换商品：${pointsGoods.productName}`,
    });

    // 创建兑换记录
    const pointsExchange = this.pointsExchangeRepository.create({
      memberId: params.memberId,
      memberName: params.memberName,
      pointsGoodsId: pointsGoods.id,
      productName: pointsGoods.productName,
      productImage: pointsGoods.productImage,
      points: totalPoints,
      value: pointsGoods.value * quantity,
      quantity,
      status: 0, // 待发货
      exchangeNo,
      shippingInfo: params.shippingInfo ? JSON.stringify(params.shippingInfo) : null,
      remark: params.remark,
    });

    const savedExchange = await this.pointsExchangeRepository.save(pointsExchange);

    // 更新商品库存和兑换数量
    await this.pointsGoodsRepository.update(
      { id: pointsGoods.id },
      {
        stock: pointsGoods.stock - quantity,
        exchangedCount: pointsGoods.exchangedCount + quantity,
      }
    );

    return savedExchange;
  }

  /**
   * 获取兑换记录列表
   */
  async getPointsExchangeList(params: {
    memberId?: string;
    status?: number;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: PointsExchange[]; total: number }> {
    const { memberId, status, startTime, endTime, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberId) {
      whereCondition.memberId = memberId;
    }

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.pointsExchangeRepository.findAndCount({
      where: whereCondition,
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    // 解析JSON字段
    items.forEach(item => {
      if (item.shippingInfo) {
        try {
          item.shippingInfo = JSON.parse(item.shippingInfo as any);
        } catch (e) {
          item.shippingInfo = {};
        }
      }
      if (item.logisticsInfo) {
        try {
          item.logisticsInfo = JSON.parse(item.logisticsInfo as any);
        } catch (e) {
          item.logisticsInfo = {};
        }
      }
    });

    return { items, total };
  }

  /**
   * 兑换发货
   */
  async shipExchange(exchangeNo: string, params: {
    logisticsInfo?: any;
    remark?: string;
  }): Promise<void> {
    const exchange = await this.pointsExchangeRepository.findOne({
      where: { exchangeNo, deleteFlag: 0 }
    });

    if (!exchange) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_NOT_FOUND);
    }

    if (exchange.status !== 0) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_CANNOT_SHIP);
    }

    await this.pointsExchangeRepository.update(
      { exchangeNo },
      {
        status: 1, // 已发货
        shipTime: new Date(),
        logisticsInfo: params.logisticsInfo ? JSON.stringify(params.logisticsInfo) : null,
        remark: params.remark,
      }
    );
  }

  /**
   * 兑换完成
   */
  async completeExchange(exchangeNo: string): Promise<void> {
    const exchange = await this.pointsExchangeRepository.findOne({
      where: { exchangeNo, deleteFlag: 0 }
    });

    if (!exchange) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_NOT_FOUND);
    }

    if (exchange.status !== 1) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_CANNOT_COMPLETE);
    }

    await this.pointsExchangeRepository.update(
      { exchangeNo },
      {
        status: 3, // 已完成
        completeTime: new Date(),
      }
    );
  }

  /**
   * 取消兑换
   */
  async cancelExchange(exchangeNo: string, reason?: string): Promise<void> {
    const exchange = await this.pointsExchangeRepository.findOne({
      where: { exchangeNo, deleteFlag: 0 }
    });

    if (!exchange) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_NOT_FOUND);
    }

    if (exchange.status !== 0) {
      throw new CustomException(CodeEnum.POINTS_EXCHANGE_CANNOT_CANCEL);
    }

    // 更新兑换状态
    await this.pointsExchangeRepository.update(
      { exchangeNo },
      {
        status: 4, // 已取消
        cancelTime: new Date(),
        cancelReason: reason,
      }
    );

    // 退还积分
    await this.changePoints({
      memberId: exchange.memberId,
      type: 8, // 管理员调整
      direction: 1, // 收入
      points: exchange.points,
      businessType: 'POINTS_EXCHANGE_CANCEL',
      businessId: exchange.id,
      businessNo: exchange.exchangeNo,
      description: `取消兑换退还积分：${exchange.productName}`,
    });

    // 恢复商品库存
    await this.pointsGoodsRepository.update(
      { id: exchange.pointsGoodsId },
      {
        stock: () => `stock + ${exchange.quantity}`,
        exchangedCount: () => `exchangedCount - ${exchange.quantity}`,
      }
    );
  }

  /**
   * 积分统计
   */
  async getPointsStatistics(memberId?: string): Promise<any> {
    const whereCondition = memberId ? { memberId, deleteFlag: 0 } : { deleteFlag: 0 };

    const pointsList = await this.pointsRepository.find({ where: whereCondition });

    const totalBalance = pointsList.reduce((sum, item) => sum + item.balance, 0);
    const totalEarned = pointsList.reduce((sum, item) => sum + item.totalEarned, 0);
    const totalSpent = pointsList.reduce((sum, item) => sum + item.totalSpent, 0);
    const totalExpired = pointsList.reduce((sum, item) => sum + item.totalExpired, 0);

    return {
      totalCount: pointsList.length,
      totalBalance,
      totalEarned,
      totalSpent,
      totalExpired,
    };
  }

  /**
   * 计算积分等级
   */
  private calculatePointsLevel(balance: number): number {
    // 这里可以根据积分余额设置不同的等级
    if (balance >= 10000) return 5;
    if (balance >= 5000) return 4;
    if (balance >= 2000) return 3;
    if (balance >= 500) return 2;
    return 1;
  }

  /**
   * 判断是否为当前年份
   */
  private isCurrentYear(date: Date): boolean {
    const now = new Date();
    return date.getFullYear() === now.getFullYear();
  }

  /**
   * 判断是否为当前月份
   */
  private isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && 
           date.getMonth() === now.getMonth();
  }

  /**
   * 生成兑换单号
   */
  private generateExchangeNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `EX${timestamp}${random}`;
  }
}