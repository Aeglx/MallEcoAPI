import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponService {
  // 获取自动发券活动
  async getAutoCoupon() {
    return {
      code: 200,
      message: '获取自动发券活动成功',
      data: {
        activityList: [
          {
            activityId: '1',
            name: '新用户注册礼包',
            couponList: [
              {
                couponId: '1',
                name: '新用户专享券',
                amount: 10,
                minAmount: 100,
                expireTime: '2024-12-31',
              },
            ],
          },
        ],
      },
    };
  }

  // 获取优惠券列表
  async getCouponList(query: any) {
    return {
      code: 200,
      message: '获取优惠券列表成功',
      data: {
        list: [
          {
            couponId: '1',
            name: '满100减10元',
            type: 1,
            amount: 10,
            minAmount: 100,
            startTime: '2024-01-01',
            endTime: '2024-12-31',
            status: 1,
          },
          {
            couponId: '2',
            name: '满200减20元',
            type: 1,
            amount: 20,
            minAmount: 200,
            startTime: '2024-01-01',
            endTime: '2024-12-31',
            status: 1,
          },
        ],
        total: 2,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 领取优惠券
  async receiveCoupon(couponId: string) {
    return {
      code: 200,
      message: '领取优惠券成功',
      data: {
        couponId,
        receiveTime: new Date().toISOString(),
      },
    };
  }

  // 获取我的优惠券
  async getMyCouponList(query: any) {
    return {
      code: 200,
      message: '获取我的优惠券成功',
      data: {
        list: [
          {
            userCouponId: '1',
            couponId: '1',
            name: '满100减10元',
            amount: 10,
            minAmount: 100,
            startTime: '2024-01-01',
            endTime: '2024-12-31',
            status: 1,
          },
        ],
        total: 1,
        page: query.page || 1,
        size: query.size || 10,
      },
    };
  }

  // 使用优惠券
  async useCoupon(userCouponId: string) {
    return {
      code: 200,
      message: '使用优惠券成功',
      data: {
        userCouponId,
        useTime: new Date().toISOString(),
      },
    };
  }

  // 获取优惠券详情
  async getCouponDetail(couponId: string) {
    return {
      code: 200,
      message: '获取优惠券详情成功',
      data: {
        couponId,
        name: '优惠券详情',
        type: 1,
        amount: 10,
        minAmount: 100,
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        description: '优惠券使用说明',
      },
    };
  }

  // 获取可用的优惠券
  async getAvailableCoupons(amount: number) {
    return {
      code: 200,
      message: '获取可用优惠券成功',
      data: {
        list: [
          {
            userCouponId: '1',
            couponId: '1',
            name: '满100减10元',
            amount: 10,
            minAmount: 100,
            startTime: '2024-01-01',
            endTime: '2024-12-31',
            canUse: amount >= 100,
          },
        ],
        total: 1,
      },
    };
  }
}
