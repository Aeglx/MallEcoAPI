import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponService {
  getAutoCouponActivity() {
    // 返回模拟的自动发券活动数据
    return {
      success: true,
      result: {
        couponActivityVos: [
          {
            id: '1',
            name: '新用户注册优惠券',
            description: '注册即可获得10元优惠券',
            startTime: '2025-01-01 00:00:00',
            endTime: '2025-12-31 23:59:59',
            couponType: 1,
            discount: 10,
            minPoint: 100,
            maxPoint: 10,
            couponValue: 10,
            couponImage: 'https://via.placeholder.com/200x100?text=Coupon1',
          },
          {
            id: '2',
            name: '满减优惠券',
            description: '满200减50元',
            startTime: '2025-01-01 00:00:00',
            endTime: '2025-12-31 23:59:59',
            couponType: 2,
            discount: 0,
            minPoint: 200,
            maxPoint: 50,
            couponValue: 50,
            couponImage: 'https://via.placeholder.com/200x100?text=Coupon2',
          },
        ],
      },
    };
  }
}
