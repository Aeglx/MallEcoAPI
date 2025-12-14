import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { Activity } from './entities/activity.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(Activity) private activityRepository: Repository<Activity>,
  ) {}

  /**
   * 创建优惠券
   */
  async createCoupon(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  /**
   * 获取优惠券列表
   */
  async getCoupons(page: number = 1, pageSize: number = 10, status?: number): Promise<{ items: Coupon[], total: number }> {
    const query = this.couponRepository.createQueryBuilder('coupon');

    if (status !== undefined) {
      query.where('coupon.status = :status', { status });
    }

    query.orderBy('coupon.createTime', 'DESC');
    const [items, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取优惠券
   */
  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    return coupon;
  }

  /**
   * 更新优惠券
   */
  async updateCoupon(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.getCouponById(id);
    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  /**
   * 删除优惠券
   */
  async deleteCoupon(id: string): Promise<void> {
    const result = await this.couponRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('优惠券不存在');
    }
  }

  /**
   * 创建活动
   */
  async createActivity(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create(createActivityDto);
    return this.activityRepository.save(activity);
  }

  /**
   * 获取活动列表
   */
  async getActivities(page: number = 1, pageSize: number = 10, status?: number): Promise<{ items: Activity[], total: number }> {
    const query = this.activityRepository.createQueryBuilder('activity');

    if (status !== undefined) {
      query.where('activity.status = :status', { status });
    }

    query.orderBy('activity.createTime', 'DESC');
    const [items, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取活动
   */
  async getActivityById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException('活动不存在');
    }
    return activity;
  }

  /**
   * 更新活动
   */
  async updateActivity(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.getActivityById(id);
    Object.assign(activity, updateActivityDto);
    return this.activityRepository.save(activity);
  }

  /**
   * 删除活动
   */
  async deleteActivity(id: string): Promise<void> {
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('活动不存在');
    }
  }
}
