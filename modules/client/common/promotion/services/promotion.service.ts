import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Promotion, PromotionParticipant } from '../entities/promotion.entity';
import { CustomException } from '../../filters/custom-exception';
import { CodeEnum } from '../../enums/code.enum';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(PromotionParticipant)
    private promotionParticipantRepository: Repository<PromotionParticipant>,
  ) {}

  /**
   * 创建营销活动
   */
  async createPromotion(data: {
    name: string;
    type: number;
    startTime: Date;
    endTime: Date;
    description?: string;
    rules?: any;
    image?: string;
    link?: string;
    tags?: string;
    sortOrder?: number;
    budget?: number;
    remark?: string;
    createBy: string;
  }): Promise<Promotion> {
    // 检查活动名称是否已存在
    const existing = await this.promotionRepository.findOne({
      where: { name: data.name, deleteFlag: 0 }
    });

    if (existing) {
      throw new CustomException(CodeEnum.PROMOTION_NAME_EXISTS);
    }

    const promotion = this.promotionRepository.create({
      ...data,
      rules: data.rules ? JSON.stringify(data.rules) : null,
      status: 1, // 默认启用
      participantCount: 0,
      viewCount: 0,
      spentAmount: 0,
    });

    return await this.promotionRepository.save(promotion);
  }

  /**
   * 分页查询营销活动
   */
  async getPromotions(query: {
    page?: number;
    limit?: number;
    name?: string;
    type?: number;
    status?: number;
    startTime?: Date;
    endTime?: Date;
    createBy?: string;
  }): Promise<{ items: Promotion[]; total: number }> {
    const { page = 1, limit = 10, name, type, status, startTime, endTime, createBy } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (name) {
      whereCondition.name = Like(`%${name}%`);
    }

    if (type) {
      whereCondition.type = type;
    }

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (createBy) {
      whereCondition.createBy = createBy;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.promotionRepository.findAndCount({
      where: whereCondition,
      order: { sortOrder: 'ASC', createTime: 'DESC' },
      skip,
      take: limit,
    });

    // 解析rules
    items.forEach(item => {
      if (item.rules) {
        try {
          item.rules = JSON.parse(item.rules as any);
        } catch (e) {
          item.rules = '{}';
        }
      }
    });

    return { items, total };
  }

  /**
   * 获取营销活动详情
   */
  async getPromotionDetail(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!promotion) {
      throw new CustomException(CodeEnum.PROMOTION_NOT_FOUND);
    }

    // 解析rules
    if (promotion.rules) {
      try {
        promotion.rules = JSON.parse(promotion.rules as any);
      } catch (e) {
        promotion.rules = '{}';
      }
    }

    return promotion;
  }

  /**
   * 更新营销活动
   */
  async updatePromotion(
    id: string,
    updateData: Partial<{
      name: string;
      type: number;
      startTime: Date;
      endTime: Date;
      description: string;
      rules: any;
      image: string;
      link: string;
      tags: string;
      sortOrder: number;
      budget: number;
      status: number;
      remark: string;
    }>,
    updateBy: string
  ): Promise<Promotion> {
    const promotion = await this.getPromotionDetail(id);

    Object.assign(promotion, updateData, {
      updateBy,
      rules: updateData.rules !== undefined ? JSON.stringify(updateData.rules) : promotion.rules,
    });

    return await this.promotionRepository.save(promotion);
  }

  /**
   * 删除营销活动
   */
  async deletePromotion(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!promotion) {
      throw new CustomException(CodeEnum.PROMOTION_NOT_FOUND);
    }

    // 如果活动有参与者，不能删除
    if (promotion.participantCount > 0) {
      throw new CustomException(CodeEnum.PROMOTION_CANNOT_DELETE);
    }

    promotion.deleteFlag = 1;
    await this.promotionRepository.save(promotion);
  }

  /**
   * 参与营销活动
   */
  async joinPromotion(promotionId: string, memberData: {
    memberId: string;
    memberName: string;
    data?: any;
  }): Promise<PromotionParticipant> {
    // 检查活动是否存在且有效
    const promotion = await this.promotionRepository.findOne({
      where: { 
        id: promotionId, 
        status: 1, 
        deleteFlag: 0,
        startTime: { $lte: new Date() } as any,
        endTime: { $gte: new Date() } as any,
      }
    });

    if (!promotion) {
      throw new CustomException(CodeEnum.PROMOTION_NOT_FOUND);
    }

    // 检查是否已经参与过
    const existing = await this.promotionParticipantRepository.findOne({
      where: { 
        promotionId, 
        memberId: memberData.memberId,
        deleteFlag: 0
      }
    });

    if (existing) {
      throw new CustomException(CodeEnum.PROMOTION_ALREADY_JOINED);
    }

    // 创建参与记录
    const participant = this.promotionParticipantRepository.create({
      promotionId,
      memberId: memberData.memberId,
      memberName: memberData.memberName,
      status: 1, // 已参与
      participateTime: new Date(),
      data: memberData.data ? JSON.stringify(memberData.data) : null,
    });

    const savedParticipant = await this.promotionParticipantRepository.save(participant);

    // 更新活动参与人数
    await this.promotionRepository.increment(
      { id: promotionId },
      'participantCount',
      1
    );

    return savedParticipant;
  }

  /**
   * 获取活动参与记录
   */
  async getPromotionParticipants(promotionId: string, query?: {
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: PromotionParticipant[]; total: number }> {
    const { status, page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const whereCondition: any = { promotionId, deleteFlag: 0 };

    if (status !== undefined) {
      whereCondition.status = status;
    }

    const [items, total] = await this.promotionParticipantRepository.findAndCount({
      where: whereCondition,
      order: { participateTime: 'DESC' },
      skip,
      take: limit,
    });

    // 解析data
    items.forEach(item => {
      if (item.data) {
        try {
          item.data = JSON.parse(item.data as any);
        } catch (e) {
          item.data = '{}';
        }
      }
    });

    return { items, total };
  }

  /**
   * 获取我参与的营销活动
   */
  async getMyPromotions(memberId: string, query?: {
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: PromotionParticipant[]; total: number }> {
    const { status, page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const whereCondition: any = { memberId, deleteFlag: 0 };

    if (status !== undefined) {
      whereCondition.status = status;
    }

    const [items, total] = await this.promotionParticipantRepository.findAndCount({
      where: whereCondition,
      relations: ['promotion'],
      order: { participateTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 完成营销活动
   */
  async completePromotion(participantId: string, data?: {
    rewardAmount?: number;
    completeData?: any;
  }): Promise<void> {
    const participant = await this.promotionParticipantRepository.findOne({
      where: { id: participantId, status: 1, deleteFlag: 0 }
    });

    if (!participant) {
      throw new CustomException(CodeEnum.PROMOTION_PARTICIPANT_NOT_FOUND);
    }

    // 更新参与状态
    participant.status = 2; // 已完成
    participant.completeTime = new Date();
    participant.rewardAmount = data?.rewardAmount || 0;

    if (data?.completeData) {
      participant.data = JSON.stringify({
        ...JSON.parse(participant.data || '{}'),
        ...data.completeData,
      });
    }

    await this.promotionParticipantRepository.save(participant);

    // 更新活动花费
    if (data?.rewardAmount) {
      await this.promotionRepository.increment(
        { id: participant.promotionId },
        'spentAmount',
        data.rewardAmount
      );
    }
  }

  /**
   * 取消参与营销活动
   */
  async cancelPromotion(participantId: string): Promise<void> {
    const participant = await this.promotionParticipantRepository.findOne({
      where: { id: participantId, status: 1, deleteFlag: 0 }
    });

    if (!participant) {
      throw new CustomException(CodeEnum.PROMOTION_PARTICIPANT_NOT_FOUND);
    }

    participant.status = 3; // 已取消
    await this.promotionParticipantRepository.save(participant);

    // 更新活动参与人数
    await this.promotionRepository.decrement(
      { id: participant.promotionId },
      'participantCount',
      1
    );
  }

  /**
   * 增加活动访问量
   */
  async incrementViewCount(promotionId: string): Promise<void> {
    await this.promotionRepository.increment(
      { id: promotionId },
      'viewCount',
      1
    );
  }

  /**
   * 启用/禁用营销活动
   */
  async toggleStatus(promotionId: string, status: number): Promise<void> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId, deleteFlag: 0 }
    });

    if (!promotion) {
      throw new CustomException(CodeEnum.PROMOTION_NOT_FOUND);
    }

    promotion.status = status;
    await this.promotionRepository.save(promotion);
  }

  /**
   * 获取营销活动统计
   */
  async getStatistics(query?: {
    type?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    const { type, startTime, endTime } = query || {};

    // 这里应该实现统计逻辑
    // 简化实现，实际应该查询数据库进行统计
    return {
      totalCount: 0,
      enabledCount: 0,
      disabledCount: 0,
      totalParticipants: 0,
      totalViews: 0,
      totalBudget: 0,
      totalSpent: 0,
      typeStatistics: [
        { type: 1, name: '优惠券活动', count: 0 },
        { type: 2, name: '满减活动', count: 0 },
        { type: 3, name: '秒杀活动', count: 0 },
        { type: 4, name: '拼团活动', count: 0 },
        { type: 5, name: '积分兑换', count: 0 },
        { type: 6, name: '签到活动', count: 0 },
        { type: 7, name: '推荐有礼', count: 0 },
      ],
    };
  }

  /**
   * 获取热门营销活动
   */
  async getHotPromotions(limit: number = 10): Promise<Promotion[]> {
    return await this.promotionRepository.find({
      where: {
        status: 1,
        deleteFlag: 0,
        startTime: { $lte: new Date() } as any,
        endTime: { $gte: new Date() } as any,
      },
      order: { 
        participantCount: 'DESC',
        viewCount: 'DESC',
      },
      take: limit,
    });
  }
}