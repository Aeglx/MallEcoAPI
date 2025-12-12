import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { 
  CouponEntity, 
  CouponMemberEntity as CouponUserEntity,
  SeckillEntity as FlashSaleEntity,
  GroupBuyEntity as GroupBuyingEntity 
} from '../../common/promotion/entities';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponSearchDto } from './dto/coupon-search.dto';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(CouponUserEntity)
    private readonly couponUserRepository: Repository<CouponUserEntity>,
    @InjectRepository(FlashSaleEntity)
    private readonly flashSaleRepository: Repository<FlashSaleEntity>,
    @InjectRepository(GroupBuyingEntity)
    private readonly groupBuyingRepository: Repository<GroupBuyingEntity>,
  ) {}

  /**
   * 创建优惠券
   */
  async createCoupon(createCouponDto: CreateCouponDto) {
    const coupon = this.couponRepository.create({
      ...createCouponDto,
      code: this.generateCouponCode(),
      status: 'active',
      createdAt: new Date(),
    });

    const savedCoupon = await this.couponRepository.save(coupon);

    this.logger.log(`Created coupon: ${savedCoupon.code}`);
    
    return {
      code: 201,
      message: '优惠券创建成功',
      data: savedCoupon,
    };
  }

  /**
   * 获取优惠券列表
   */
  async getCoupons(searchDto: CouponSearchDto) {
    const { 
      name, 
      type, 
      status, 
      page = 1, 
      limit = 10 
    } = searchDto;

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon');

    if (name) {
      queryBuilder.andWhere('coupon.name LIKE :name', { name: `%${name}%` });
    }

    if (type) {
      queryBuilder.andWhere('coupon.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('coupon.status = :status', { status });
    }

    const total = await queryBuilder.getCount();

    const coupons = await queryBuilder
      .orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      code: 200,
      message: '获取成功',
      data: {
        coupons,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * 用户领取优惠券
   */
  async claimCoupon(userId: string, couponCode: string) {
    const coupon = await this.couponRepository.findOne({
      where: { 
        code: couponCode, 
        status: 'active',
        startTime: LessThan(new Date()),
        endTime: MoreThan(new Date()),
      },
    });

    if (!coupon) {
      throw new Error('优惠券不存在或已失效');
    }

    // 检查是否已经领取
    const existingClaim = await this.couponUserRepository.findOne({
      where: { userId, couponId: coupon.id },
    });

    if (existingClaim) {
      throw new Error('已经领取过该优惠券');
    }

    // 检查领取数量限制
    const claimCount = await this.couponUserRepository.count({
      where: { couponId: coupon.id },
    });

    if (claimCount >= coupon.maxClaimCount) {
      throw new Error('优惠券已领完');
    }

    // 创建领取记录
    const couponUser = this.couponUserRepository.create({
      userId,
      couponId: coupon.id,
      status: 'unused',
      claimedAt: new Date(),
    });

    await this.couponUserRepository.save(couponUser);

    // 更新优惠券领取数量
    await this.couponRepository.update(
      { id: coupon.id },
      { claimedCount: coupon.claimedCount + 1 }
    );

    this.logger.log(`User ${userId} claimed coupon: ${couponCode}`);

    return {
      code: 200,
      message: '领取成功',
      data: couponUser,
    };
  }

  /**
   * 使用优惠券
   */
  async useCoupon(userId: string, couponId: string, orderId: string) {
    const couponUser = await this.couponUserRepository.findOne({
      where: { userId, couponId, status: 'unused' },
      relations: ['coupon'],
    });

    if (!couponUser) {
      throw new Error('优惠券不存在或已使用');
    }

    const coupon = couponUser.coupon;

    // 检查优惠券是否过期
    if (new Date() > coupon.endTime) {
      throw new Error('优惠券已过期');
    }

    // 更新使用状态
    couponUser.status = 'used';
    couponUser.usedAt = new Date();
    couponUser.orderId = orderId;

    await this.couponUserRepository.save(couponUser);

    // 更新优惠券使用数量
    await this.couponRepository.update(
      { id: couponId },
      { usedCount: coupon.usedCount + 1 }
    );

    this.logger.log(`User ${userId} used coupon: ${couponId} for order: ${orderId}`);

    return {
      code: 200,
      message: '使用成功',
      data: couponUser,
    };
  }

  /**
   * 获取用户优惠券列表
   */
  async getUserCoupons(userId: string, status?: string) {
    const queryBuilder = this.couponUserRepository
      .createQueryBuilder('couponUser')
      .leftJoinAndSelect('coupon', 'coupon', 'couponUser.couponId = coupon.id')
      .where('couponUser.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('couponUser.status = :status', { status });
    }

    const couponUsers = await queryBuilder
      .orderBy('couponUser.claimedAt', 'DESC')
      .getMany();

    return {
      code: 200,
      message: '获取成功',
      data: couponUsers,
    };
  }

  /**
   * 创建秒杀活动
   */
  async createFlashSale(createFlashSaleDto: any) {
    const flashSale = this.flashSaleRepository.create({
      ...createFlashSaleDto,
      status: 'active',
      createdAt: new Date(),
    });

    const savedFlashSale = await this.flashSaleRepository.save(flashSale);

    this.logger.log(`Created flash sale: ${savedFlashSale.id}`);
    
    return {
      code: 201,
      message: '秒杀活动创建成功',
      data: savedFlashSale,
    };
  }

  /**
   * 创建拼团活动
   */
  async createGroupBuying(createGroupBuyingDto: any) {
    const groupBuying = this.groupBuyingRepository.create({
      ...createGroupBuyingDto,
      status: 'active',
      createdAt: new Date(),
    });

    const savedGroupBuying = await this.groupBuyingRepository.save(groupBuying);

    this.logger.log(`Created group buying: ${savedGroupBuying.id}`);
    
    return {
      code: 201,
      message: '拼团活动创建成功',
      data: savedGroupBuying,
    };
  }

  /**
   * 生成优惠券码
   */
  private generateCouponCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * 更新优惠券状态
   */
  async updateCouponStatus(couponId: string, status: string) {
    await this.couponRepository.update(
      { id: couponId },
      { status, updatedAt: new Date() }
    );

    return {
      code: 200,
      message: '状态更新成功',
    };
  }

  /**
   * 获取优惠券统计
   */
  async getCouponStatistics(couponId: string) {
    const [claimedCount, usedCount] = await Promise.all([
      this.couponUserRepository.count({
        where: { couponId },
      }),
      this.couponUserRepository.count({
        where: { couponId, status: 'used' },
      }),
    ]);

    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
    });

    return {
      code: 200,
      message: '获取成功',
      data: {
        couponId,
        couponName: coupon?.name,
        totalCreated: coupon?.maxClaimCount,
        claimedCount,
        usedCount,
        remainingCount: coupon?.maxClaimCount - claimedCount,
        usageRate: claimedCount > 0 ? (usedCount / claimedCount * 100).toFixed(2) : 0,
      },
    };
  }
}