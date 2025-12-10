import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { FullDiscount, FullDiscountRule } from '../entities/full-discount.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class FullDiscountService {
  constructor(
    @InjectRepository(FullDiscount)
    private fullDiscountRepository: Repository<FullDiscount>,
    @InjectRepository(FullDiscountRule)
    private fullDiscountRuleRepository: Repository<FullDiscountRule>,
  ) {}

  /**
   * 创建满减活动
   */
  async createFullDiscount(data: {
    name: string;
    type: number;
    useRange: number;
    useRangeIds?: string[];
    startTime: Date;
    endTime: Date;
    description?: string;
    remark?: string;
    rules: Array<{
      fullAmount: number;
      value: number;
      level: number;
      isRepeat?: number;
      giftIds?: string[];
      remark?: string;
    }>;
    createBy: string;
  }): Promise<FullDiscount> {
    // 检查活动名称是否已存在
    const existing = await this.fullDiscountRepository.findOne({
      where: { name: data.name, deleteFlag: 0 }
    });

    if (existing) {
      throw new CustomException(CodeEnum.FULL_DISCOUNT_NAME_EXISTS);
    }

    // 创建满减活动
    const fullDiscount = this.fullDiscountRepository.create({
      name: data.name,
      type: data.type,
      useRange: data.useRange,
      useRangeIds: data.useRangeIds ? JSON.stringify(data.useRangeIds) : null,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      remark: data.remark,
      createBy: data.createBy,
    });

    const savedFullDiscount = await this.fullDiscountRepository.save(fullDiscount);

    // 创建活动规则
    for (const rule of data.rules) {
      const fullDiscountRule = this.fullDiscountRuleRepository.create({
        fullDiscountId: savedFullDiscount.id,
        fullAmount: rule.fullAmount,
        value: rule.value,
        level: rule.level,
        isRepeat: rule.isRepeat || 0,
        giftIds: rule.giftIds ? JSON.stringify(rule.giftIds) : null,
        remark: rule.remark,
      });

      await this.fullDiscountRuleRepository.save(fullDiscountRule);
    }

    return savedFullDiscount;
  }

  /**
   * 分页查询满减活动
   */
  async getFullDiscounts(query: {
    page?: number;
    limit?: number;
    name?: string;
    type?: number;
    status?: number;
    startTime?: Date;
    endTime?: Date;
    createBy?: string;
  }): Promise<{ items: FullDiscount[]; total: number }> {
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

    const [items, total] = await this.fullDiscountRepository.find({
      where: whereCondition,
      relations: ['rules'],
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    // 解析useRangeIds
    items.forEach(item => {
      if (item.useRangeIds) {
        try {
          item.useRangeIds = JSON.parse(item.useRangeIds as any);
        } catch (e) {
          item.useRangeIds = [];
        }
      }

      // 解析规则中的giftIds
      if (item.rules) {
        item.rules.forEach(rule => {
          if (rule.giftIds) {
            try {
              rule.giftIds = JSON.parse(rule.giftIds as any);
            } catch (e) {
              rule.giftIds = [];
            }
          }
        });
      }
    });

    return { items, total };
  }

  /**
   * 获取满减活动详情
   */
  async getFullDiscountDetail(id: string): Promise<FullDiscount> {
    const fullDiscount = await this.fullDiscountRepository.findOne({
      where: { id, deleteFlag: 0 },
      relations: ['rules']
    });

    if (!fullDiscount) {
      throw new CustomException(CodeEnum.FULL_DISCOUNT_NOT_FOUND);
    }

    // 解析useRangeIds
    if (fullDiscount.useRangeIds) {
      try {
        fullDiscount.useRangeIds = JSON.parse(fullDiscount.useRangeIds as any);
      } catch (e) {
        fullDiscount.useRangeIds = [];
      }
    }

    // 解析规则中的giftIds
    if (fullDiscount.rules) {
      fullDiscount.rules.forEach(rule => {
        if (rule.giftIds) {
          try {
            rule.giftIds = JSON.parse(rule.giftIds as any);
          } catch (e) {
            rule.giftIds = [];
          }
        }
      });
    }

    return fullDiscount;
  }

  /**
   * 更新满减活动
   */
  async updateFullDiscount(
    id: string,
    data: {
      name?: string;
      type?: number;
      useRange?: number;
      useRangeIds?: string[];
      startTime?: Date;
      endTime?: Date;
      description?: string;
      remark?: string;
      rules?: Array<{
        id?: string;
        fullAmount: number;
        value: number;
        level: number;
        isRepeat?: number;
        giftIds?: string[];
        remark?: string;
      }>;
    },
    updateBy: string
  ): Promise<FullDiscount> {
    const fullDiscount = await this.getFullDiscountDetail(id);

    // 更新基本信息
    Object.assign(fullDiscount, data, {
      updateBy,
      useRangeIds: data.useRangeIds ? JSON.stringify(data.useRangeIds) : fullDiscount.useRangeIds,
    });

    const savedFullDiscount = await this.fullDiscountRepository.save(fullDiscount);

    // 更新规则
    if (data.rules) {
      // 先删除原有规则
      await this.fullDiscountRuleRepository.delete({
        fullDiscountId: id
      });

      // 创建新规则
      for (const rule of data.rules) {
        const fullDiscountRule = this.fullDiscountRuleRepository.create({
          fullDiscountId: id,
          fullAmount: rule.fullAmount,
          value: rule.value,
          level: rule.level,
          isRepeat: rule.isRepeat || 0,
          giftIds: rule.giftIds ? JSON.stringify(rule.giftIds) : null,
          remark: rule.remark,
        });

        await this.fullDiscountRuleRepository.save(fullDiscountRule);
      }
    }

    return savedFullDiscount;
  }

  /**
   * 删除满减活动
   */
  async deleteFullDiscount(id: string): Promise<void> {
    const fullDiscount = await this.fullDiscountRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!fullDiscount) {
      throw new CustomException(CodeEnum.FULL_DISCOUNT_NOT_FOUND);
    }

    fullDiscount.deleteFlag = 1;
    await this.fullDiscountRepository.save(fullDiscount);
  }

  /**
   * 计算满减优惠金额
   */
  async calculateFullDiscount(
    orderAmount: number,
    productIds: string[] = [],
    categoryIds: string[] = [],
    brandIds: string[] = []
  ): Promise<{ discountAmount: number; rules: any[] }> {
    const now = new Date();
    const whereCondition = {
      status: 1, // 启用状态
      deleteFlag: 0,
      startTime: { $lte: now } as any,
      endTime: { $gte: now } as any,
    };

    // 获取有效的满减活动
    const fullDiscounts = await this.fullDiscountRepository.find({
      where: whereCondition,
      relations: ['rules']
    });

    let totalDiscountAmount = 0;
    const appliedRules: any[] = [];

    for (const fullDiscount of fullDiscounts) {
      // 检查适用范围
      const isApplicable = await this.checkUseRange(fullDiscount, productIds, categoryIds, brandIds);
      if (!isApplicable) {
        continue;
      }

      // 获取匹配的规则（按满额降序）
      const applicableRules = fullDiscount.rules
        .filter(rule => orderAmount >= rule.fullAmount)
        .sort((a, b) => b.fullAmount - a.fullAmount);

      if (applicableRules.length === 0) {
        continue;
      }

      // 应用最优规则（满额最高的）
      const bestRule = applicableRules[0];
      let discountAmount = 0;

      switch (fullDiscount.type) {
        case 1: // 满减
          discountAmount = bestRule.value;
          break;
        case 2: // 满折
          discountAmount = orderAmount * (bestRule.value / 100);
          break;
        case 3: // 满赠
          // 满赠不计算金额，只记录
          break;
      }

      if (discountAmount > 0 || fullDiscount.type === 3) {
        totalDiscountAmount += discountAmount;
        appliedRules.push({
          fullDiscountId: fullDiscount.id,
          fullDiscountName: fullDiscount.name,
          type: fullDiscount.type,
          fullAmount: bestRule.fullAmount,
          value: bestRule.value,
          discountAmount,
          isRepeat: bestRule.isRepeat,
          giftIds: bestRule.giftIds ? JSON.parse(bestRule.giftIds as any) : [],
        });

        // 如果不支持重复享受，则跳出循环
        if (bestRule.isRepeat === 0) {
          break;
        }
      }
    }

    return {
      discountAmount: Math.min(totalDiscountAmount, orderAmount),
      rules: appliedRules,
    };
  }

  /**
   * 检查适用范围
   */
  private async checkUseRange(
    fullDiscount: FullDiscount,
    productIds: string[],
    categoryIds: string[],
    brandIds: string[]
  ): Promise<boolean> {
    if (fullDiscount.useRange === 0) {
      // 全场通用
      return true;
    }

    const useRangeIds = fullDiscount.useRangeIds ? JSON.parse(fullDiscount.useRangeIds as any) : [];
    
    switch (fullDiscount.useRange) {
      case 1: // 指定商品
        return productIds.some(id => useRangeIds.includes(id));
      case 2: // 指定分类
        return categoryIds.some(id => useRangeIds.includes(id));
      case 3: // 指定品牌
        return brandIds.some(id => useRangeIds.includes(id));
      default:
        return false;
    }
  }

  /**
   * 启用/禁用满减活动
   */
  async toggleStatus(id: string, status: number): Promise<void> {
    const fullDiscount = await this.fullDiscountRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!fullDiscount) {
      throw new CustomException(CodeEnum.FULL_DISCOUNT_NOT_FOUND);
    }

    fullDiscount.status = status;
    await this.fullDiscountRepository.save(fullDiscount);
  }

  /**
   * 获取满减活动统计
   */
  async getStatistics(query?: {
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    // 这里应该实现统计逻辑
    // 简化实现，实际应该查询相关表进行统计
    return {
      totalCount: 0,
      enabledCount: 0,
      disabledCount: 0,
      expiredCount: 0,
      totalDiscountAmount: 0,
      usageCount: 0,
    };
  }
}