import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatCoupon } from '../entities/wechat-coupon.entity';
import { WechatCouponTemplate } from '../entities/wechat-coupon-template.entity';
import { WechatCouponRecord } from '../entities/wechat-coupon-record.entity';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CreateCouponTemplateDto } from '../dto/create-coupon-template.dto';
import { UpdateCouponTemplateDto } from '../dto/update-coupon-template.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { QueryCouponTemplateDto } from '../dto/query-coupon-template.dto';
import { QueryCouponRecordDto } from '../dto/query-coupon-record.dto';

@Injectable()
export class WechatCouponService {
  constructor(
    @InjectRepository(WechatCoupon)
    private readonly couponRepository: Repository<WechatCoupon>,
    @InjectRepository(WechatCouponTemplate)
    private readonly couponTemplateRepository: Repository<WechatCouponTemplate>,
    @InjectRepository(WechatCouponRecord)
    private readonly couponRecordRepository: Repository<WechatCouponRecord>,
  ) {}

  // 卡券管理
  async getCouponList(queryDto: QueryCouponDto) {
    const { page = 1, pageSize = 10, title, status, couponType } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    if (title) {
      queryBuilder.andWhere('coupon.title LIKE :title', { title: `%${title}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('coupon.status = :status', { status });
    }

    if (couponType) {
      queryBuilder.andWhere('coupon.couponType = :couponType', { couponType });
    }

    const [list, total] = await queryBuilder
      .orderBy('coupon.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getCouponById(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`卡券不存在: ${id}`);
    }
    return coupon;
  }

  async createCoupon(createDto: CreateCouponDto) {
    const coupon = this.couponRepository.create(createDto);
    return await this.couponRepository.save(coupon);
  }

  async updateCoupon(id: string, updateDto: UpdateCouponDto) {
    const coupon = await this.getCouponById(id);
    Object.assign(coupon, updateDto);
    return await this.couponRepository.save(coupon);
  }

  async deleteCoupon(id: string) {
    const coupon = await this.getCouponById(id);
    await this.couponRepository.remove(coupon);
    return { success: true, message: '卡券删除成功' };
  }

  // 卡券模板管理
  async getCouponTemplates(queryDto: QueryCouponTemplateDto) {
    const { page = 1, pageSize = 10, name, templateType } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.couponTemplateRepository.createQueryBuilder('template');

    if (name) {
      queryBuilder.andWhere('template.name LIKE :name', { name: `%${name}%` });
    }

    if (templateType) {
      queryBuilder.andWhere('template.templateType = :templateType', { templateType });
    }

    const [list, total] = await queryBuilder
      .orderBy('template.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getCouponTemplateById(id: string) {
    const template = await this.couponTemplateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`卡券模板不存在: ${id}`);
    }
    return template;
  }

  async createCouponTemplate(createDto: CreateCouponTemplateDto) {
    const template = this.couponTemplateRepository.create(createDto);
    return await this.couponTemplateRepository.save(template);
  }

  async updateCouponTemplate(id: string, updateDto: UpdateCouponTemplateDto) {
    const template = await this.getCouponTemplateById(id);
    Object.assign(template, updateDto);
    return await this.couponTemplateRepository.save(template);
  }

  async deleteCouponTemplate(id: string) {
    const template = await this.getCouponTemplateById(id);
    await this.couponTemplateRepository.remove(template);
    return { success: true, message: '卡券模板删除成功' };
  }

  // 卡券核销记录
  async getCouponRecords(queryDto: QueryCouponRecordDto) {
    const { page = 1, pageSize = 10, couponId, userId, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.couponRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.coupon', 'coupon')
      .leftJoinAndSelect('record.user', 'user');

    if (couponId) {
      queryBuilder.andWhere('record.couponId = :couponId', { couponId });
    }

    if (userId) {
      queryBuilder.andWhere('record.userId = :userId', { userId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('record.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('record.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getCouponRecordById(id: string) {
    const record = await this.couponRecordRepository.findOne({ 
      where: { id },
      relations: ['coupon', 'user'] 
    });
    if (!record) {
      throw new NotFoundException(`卡券记录不存在: ${id}`);
    }
    return record;
  }

  // 核销卡券
  async verifyCoupon(recordId: string, verifyData: { operatorId: string }) {
    const record = await this.getCouponRecordById(recordId);
    
    if (record.status !== 1) { // 1: 待核销
      throw new NotFoundException('卡券状态不正确，无法核销');
    }

    record.status = 2; // 已核销
    record.verifyTime = new Date();

    return await this.couponRecordRepository.save(record);
  }
}