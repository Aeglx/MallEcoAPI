import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);

  /**
   * 计算订单优惠金额
   */
  async calculateOrderDiscount(userId: string, items: any[], couponCode?: string) {
    let totalDiscount = 0;
    let discountDetails = [];

    // 计算优惠券折扣
    if (couponCode) {
      try {
        // 这里需要调用coupon service来验证和使用优惠券
        const couponDiscount = await this.applyCoupon(userId, couponCode, items);
        if (couponDiscount) {
          totalDiscount += couponDiscount.amount;
          discountDetails.push({
            type: 'coupon',
            name: couponDiscount.name,
            amount: couponDiscount.amount,
            description: couponDiscount.description,
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to apply coupon ${couponCode}: ${error.message}`);
      }
    }

    // 计算会员折扣
    const memberDiscount = await this.calculateMemberDiscount(userId, items);
    if (memberDiscount) {
      totalDiscount += memberDiscount.amount;
      discountDetails.push({
        type: 'member',
        name: memberDiscount.name,
        amount: memberDiscount.amount,
        description: memberDiscount.description,
      });
    }

    // 计算促销活动折扣
    const promotionDiscount = await this.calculatePromotionDiscount(userId, items);
    if (promotionDiscount) {
      totalDiscount += promotionDiscount.amount;
      discountDetails.push({
        type: 'promotion',
        name: promotionDiscount.name,
        amount: promotionDiscount.amount,
        description: promotionDiscount.description,
      });
    }

    return {
      totalDiscount,
      discountDetails,
      appliedRules: discountDetails.length,
    };
  }

  /**
   * 应用优惠券
   */
  private async applyCoupon(userId: string, couponCode: string, items: any[]) {
    // 这里需要注入CouponService来处理优惠券逻辑
    // 暂时返回模拟数据
    return {
      name: '优惠券折扣',
      amount: 10,
      description: '使用优惠券优惠10元',
    };
  }

  /**
   * 计算会员折扣
   */
  private async calculateMemberDiscount(userId: string, items: any[]) {
    // 根据用户会员等级计算折扣
    // 暂时返回模拟数据
    return {
      name: '会员折扣',
      amount: 5,
      description: 'VIP会员享受5%折扣',
    };
  }

  /**
   * 计算促销活动折扣
   */
  private async calculatePromotionDiscount(userId: string, items: any[]) {
    // 检查适用的促销活动
    // 暂时返回模拟数据
    return {
      name: '限时特惠',
      amount: 8,
      description: '限时特惠活动优惠8元',
    };
  }

  /**
   * 获取适用促销活动
   */
  async getApplicablePromotions(userId: string, items: any[]) {
    // 根据用户和商品获取适用的促销活动
    return {
      code: 200,
      message: '获取成功',
      data: [
        {
          id: 'promo1',
          name: '新用户专享',
          type: 'new_user',
          discount: 15,
          description: '新用户首单立减15元',
          startTime: new Date(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'promo2',
          name: '满减活动',
          type: 'full_discount',
          discount: 20,
          minAmount: 100,
          description: '满100减20',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ],
    };
  }

  /**
   * 验证促销规则
   */
  async validatePromotionRules(promotionId: string, userId: string, orderInfo: any) {
    // 验证促销规则是否满足
    const promotion = await this.getPromotionById(promotionId);
    
    if (!promotion) {
      throw new Error('促销活动不存在');
    }

    if (new Date() < promotion.startTime || new Date() > promotion.endTime) {
      throw new Error('促销活动不在有效期内');
    }

    // 验证具体规则
    const validationResult = await this.checkPromotionConditions(promotion, userId, orderInfo);

    return {
      valid: validationResult.valid,
      discount: validationResult.valid ? promotion.discount : 0,
      message: validationResult.message,
    };
  }

  /**
   * 获取促销详情
   */
  private async getPromotionById(promotionId: string) {
    // 模拟促销活动数据
    return {
      id: promotionId,
      name: '满减活动',
      type: 'full_discount',
      discount: 20,
      minAmount: 100,
      maxDiscount: 50,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      conditions: {
        userType: ['new', 'vip'],
        productCategory: ['electronics', 'clothing'],
        minOrderCount: 1,
      },
    };
  }

  /**
   * 检查促销条件
   */
  private async checkPromotionConditions(promotion: any, userId: string, orderInfo: any) {
    const conditions = promotion.conditions;
    
    // 检查用户类型
    if (conditions.userType && !conditions.userType.includes(await this.getUserType(userId))) {
      return {
        valid: false,
        message: '用户类型不满足促销条件',
      };
    }

    // 检查最低金额
    if (conditions.minAmount && orderInfo.totalAmount < conditions.minAmount) {
      return {
        valid: false,
        message: `订单金额不足${conditions.minAmount}元`,
      };
    }

    // 检查商品类别
    if (conditions.productCategory) {
      const hasValidCategory = orderInfo.items.some((item: any) => 
        conditions.productCategory.includes(item.category)
      );
      if (!hasValidCategory) {
        return {
          valid: false,
          message: '商品类别不满足促销条件',
        };
      }
    }

    return {
      valid: true,
      message: '促销条件验证通过',
    };
  }

  /**
   * 获取用户类型
   */
  private async getUserType(userId: string): Promise<string> {
    // 模拟获取用户类型
    return 'vip';
  }
}