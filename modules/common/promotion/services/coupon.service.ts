import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CouponMember } from '../entities/coupon-member.entity';
import { CouponCreateDto } from '../dto/coupon-create.dto';
import { CouponQueryDto, CouponMemberQueryDto, CouponStatus, CouponType } from '../dto/coupon-query.dto';
import { Member } from '../../member/entities/member.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponMember)
    private couponMemberRepository: Repository<CouponMember>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 创建优惠券
   */
  async createCoupon(createDto: CouponCreateDto, createBy: string): Promise<Coupon> {
    // 生成优惠券编码
    const code = await this.generateCouponCode();

    // 检查优惠券编码是否已存在
    const existingCoupon = await this.couponRepository.findOne({
      where: { code }
    });

    if (existingCoupon) {
      throw new CustomException(CodeEnum.COUPON_CODE_EXISTS);
    }

    const coupon = this.couponRepository.create({
      ...createDto,
      code,
      createBy,
      useRangeIds: createDto.useRangeIds ? JSON.stringify(createDto.useRangeIds) : null,
    });

    return await this.couponRepository.save(coupon);
  }

  /**
   * 生成优惠券编码
   */
  private async generateCouponCode(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CP${timestamp}${random}`;
  }

  /**
   * 分页查询优惠券
   */
  async getCoupons(queryDto: CouponQueryDto): Promise<{ items: Coupon[]; total: number }> {
    const { page = 1, limit = 10, name, code, type, status, startTime, endTime, createBy } = queryDto;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (name) {
      whereCondition.name = Like(`%${name}%`);
    }

    if (code) {
      whereCondition.code = Like(`%${code}%`);
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

    const [items, total] = await this.couponRepository.findAndCount({
      where: whereCondition,
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
    });

    return { items, total };
  }

  /**
   * 获取优惠券详情
   */
  async getCouponDetail(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!coupon) {
      throw new CustomException(CodeEnum.COUPON_NOT_FOUND);
    }

    // 解析useRangeIds
    if (coupon.useRangeIds) {
      try {
        coupon.useRangeIds = JSON.parse(coupon.useRangeIds as any);
      } catch (e) {
        coupon.useRangeIds = [];
      }
    }

    return coupon;
  }

  /**
   * 更新优惠券
   */
  async updateCoupon(id: string, updateDto: Partial<CouponCreateDto>, updateBy: string): Promise<Coupon> {
    const coupon = await this.getCouponDetail(id);

    // 如果优惠券已发放，不能修改某些字段
    if (coupon.receivedCount > 0) {
      const allowedFields = ['description', 'remark', 'status'];
      const updateKeys = Object.keys(updateDto);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          throw new CustomException(CodeEnum.COUPON_CANNOT_UPDATE);
        }
      }
    }

    Object.assign(coupon, updateDto, {
      updateBy,
      useRangeIds: updateDto.useRangeIds ? JSON.stringify(updateDto.useRangeIds) : coupon.useRangeIds,
    });

    return await this.couponRepository.save(coupon);
  }

  /**
   * 删除优惠券
   */
  async deleteCoupon(id: string): Promise<void> {
    const coupon = await this.getCouponDetail(id);

    // 如果优惠券已领取，不能删除
    if (coupon.receivedCount > 0) {
      throw new CustomException(CodeEnum.COUPON_CANNOT_DELETE);
    }

    coupon.deleteFlag = 1;
    await this.couponRepository.save(coupon);
  }

  /**
   * 会员领取优惠券
   */
  async receiveCoupon(couponId: string, memberId: string): Promise<CouponMember> {
    // 检查优惠券是否存在且可领取
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, status: 1, deleteFlag: 0 }
    });

    if (!coupon) {
      throw new CustomException(CodeEnum.COUPON_NOT_FOUND);
    }

    // 检查领取时间是否在范围内
    const now = new Date();
    if (coupon.grantStartTime && now < coupon.grantStartTime) {
      throw new CustomException(CodeEnum.COUPON_NOT_STARTED);
    }

    if (coupon.grantEndTime && now > coupon.grantEndTime) {
      throw new CustomException(CodeEnum.COUPON_HAS_ENDED);
    }

    // 检查是否已领取完
    if (coupon.totalCount > 0 && coupon.receivedCount >= coupon.totalCount) {
      throw new CustomException(CodeEnum.COUPON_RECEIVED_ALL);
    }

    // 检查会员是否已领取过（限领）
    const myReceivedCount = await this.couponMemberRepository.count({
      where: { couponId, memberId, deleteFlag: 0 }
    });

    if (coupon.limitCount > 0 && myReceivedCount >= coupon.limitCount) {
      throw new CustomException(CodeEnum.COUPON_RECEIVE_LIMIT);
    }

    // 检查会员是否存在
    const member = await this.memberRepository.findOne({
      where: { id: memberId, deleteFlag: 0 }
    });

    if (!member) {
      throw new CustomException(CodeEnum.MEMBER_NOT_FOUND);
    }

    // 计算过期时间
    let expireTime: Date;
    if (coupon.validType === 1) {
      // 固定时间
      expireTime = coupon.validEndTime;
    } else {
      // 领取后N天有效
      const now = new Date();
      expireTime = new Date(now.getTime() + coupon.validDays * 24 * 60 * 60 * 1000);
    }

    // 创建会员优惠券记录
    const couponMember = this.couponMemberRepository.create({
      couponId,
      memberId,
      memberName: member.nickname || member.mobile,
      status: 0, // 未使用
      expireTime,
      discountAmount: coupon.amount,
    });

    const savedCouponMember = await this.couponMemberRepository.save(couponMember);

    // 更新优惠券领取数量
    await this.couponRepository.increment(
      { id: couponId },
      'receivedCount',
      1
    );

    return savedCouponMember;
  }

  /**
   * 获取我的优惠券
   */
  async getMyCoupons(queryDto: CouponMemberQueryDto): Promise<{ items: CouponMember[]; total: number }> {
    const { page = 1, limit = 10, memberId, couponId, status, startTime, endTime } = queryDto;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberId) {
      whereCondition.memberId = memberId;
    }

    if (couponId) {
      whereCondition.couponId = couponId;
    }

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.couponMemberRepository.find({
      where: whereCondition,
      relations: ['coupon'],
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 使用优惠券
   */
  async useCoupon(id: string, orderId: string, orderNo: string): Promise<void> {
    const couponMember = await this.couponMemberRepository.findOne({
      where: { id, status: 0, deleteFlag: 0 }
    });

    if (!couponMember) {
      throw new CustomException(CodeEnum.COUPON_MEMBER_NOT_FOUND);
    }

    // 检查优惠券是否过期
    if (couponMember.expireTime && new Date() > couponMember.expireTime) {
      couponMember.status = 2; // 已过期
      await this.couponMemberRepository.save(couponMember);
      throw new CustomException(CodeEnum.COUPON_EXPIRED);
    }

    // 更新优惠券状态
    couponMember.status = 1; // 已使用
    couponMember.useTime = new Date();
    couponMember.orderId = orderId;
    couponMember.orderNo = orderNo;

    await this.couponMemberRepository.save(couponMember);

    // 更新优惠券使用数量
    await this.couponRepository.increment(
      { id: couponMember.couponId },
      'usedCount',
      1
    );
  }

  /**
   * 取消使用优惠券（退款等情况）
   */
  async cancelCouponUse(orderId: string): Promise<void> {
    const couponMembers = await this.couponMemberRepository.find({
      where: { orderId, status: 1, deleteFlag: 0 }
    });

    for (const couponMember of couponMembers) {
      couponMember.status = 0; // 未使用
      couponMember.useTime = null;
      couponMember.orderId = null;
      couponMember.orderNo = null;
      couponMember.invalidTime = new Date();

      await this.couponMemberRepository.save(couponMember);

      // 更新优惠券使用数量
      await this.couponRepository.decrement(
        { id: couponMember.couponId },
        'usedCount',
        1
      );
    }
  }

  /**
   * 计算优惠券优惠金额
   */
  async calculateCouponDiscount(couponId: string, orderAmount: number, productIds: string[] = []): Promise<number> {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, status: 1, deleteFlag: 0 }
    });

    if (!coupon) {
      return 0;
    }

    // 检查最低消费金额
    if (coupon.minAmount > 0 && orderAmount < coupon.minAmount) {
      return 0;
    }

    // 计算优惠金额
    let discountAmount = 0;

    switch (coupon.type) {
      case CouponType.CASH:
        // 现金券
        discountAmount = coupon.amount;
        break;
      case CouponType.FULL_DISCOUNT:
        // 满减券
        if (orderAmount >= coupon.minAmount) {
          discountAmount = coupon.amount;
        }
        break;
      case CouponType.DISCOUNT:
        // 折扣券
        if (orderAmount >= coupon.minAmount) {
          discountAmount = orderAmount * (1 - coupon.discount / 100);
        }
        break;
    }

    return Math.min(discountAmount, orderAmount);
  }

  /**
   * 系统发放优惠券
   */
  async grantCoupon(couponId: string, memberIds: string[]): Promise<number> {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, grantType: 2, status: 1, deleteFlag: 0 }
    });

    if (!coupon) {
      throw new CustomException(CodeEnum.COUPON_NOT_FOUND);
    }

    let successCount = 0;

    for (const memberId of memberIds) {
      try {
        await this.receiveCoupon(couponId, memberId);
        successCount++;
      } catch (error) {
        // 忽略单个失败的情况
        continue;
      }
    }

    return successCount;
  }
}