import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DistributionLink } from '../entities/distribution-link.entity';
import { Distribution } from '../entities/distribution.entity';
import { Product } from '../../product/entities/product.entity';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../enums/error.enum';
import { generateLinkCode } from '../../../utils/string.util';

@Injectable()
export class DistributionLinkService {
  constructor(
    @InjectRepository(DistributionLink)
    private readonly distributionLinkRepository: Repository<DistributionLink>,
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建推广链接
   */
  async createDistributionLink(data: {
    distributionId: string;
    linkType: 'default' | 'custom' | 'product' | 'activity';
    linkTitle?: string;
    linkDescription?: string;
    shareImage?: string;
    productId?: string;
    activityId?: string;
    customParams?: string;
    expireTime?: Date;
    remark?: string;
  }): Promise<DistributionLink> {
    // 验证分销员
    const distribution = await this.distributionRepository.findOne({
      where: { id: data.distributionId, status: 'approved' },
    });
    if (!distribution) {
      throw new ApiException(ErrorCode.DISTRIBUTION_NOT_FOUND);
    }

    // 验证商品（如果是商品链接）
    if (data.linkType === 'product' && data.productId) {
      const product = await this.productRepository.findOne({
        where: { id: data.productId },
      });
      if (!product) {
        throw new ApiException(ErrorCode.PRODUCT_NOT_FOUND);
      }
    }

    // 生成推广链接
    const linkCode = await generateLinkCode();
    const linkUrl = await this.generateLinkUrl(linkCode, data);
    const qrCodeUrl = await this.generateQrCode(linkUrl);
    const posterUrl = await this.generatePoster(linkCode, data);

    const distributionLink = this.distributionLinkRepository.create({
      distributionId: data.distributionId,
      linkCode,
      linkUrl,
      qrCodeUrl,
      posterUrl,
      linkType: data.linkType,
      linkTitle: data.linkTitle,
      linkDescription: data.linkDescription,
      shareImage: data.shareImage,
      productId: data.productId,
      activityId: data.activityId,
      customParams: data.customParams,
      expireTime: data.expireTime,
      status: 'active',
      clickCount: 0,
      uvCount: 0,
      orderCount: 0,
      orderAmount: 0,
      commissionAmount: 0,
      convertRate: 0,
      remark: data.remark,
    });

    return await this.distributionLinkRepository.save(distributionLink);
  }

  /**
   * 生成链接URL
   */
  private async generateLinkUrl(linkCode: string, data: any): Promise<string> {
    const baseUrl = process.env.BASE_URL || 'https://mall.example.com';
    
    switch (data.linkType) {
      case 'default':
        return `${baseUrl}?invite=${linkCode}`;
      case 'product':
        return `${baseUrl}/product/${data.productId}?invite=${linkCode}`;
      case 'activity':
        return `${baseUrl}/activity/${data.activityId}?invite=${linkCode}`;
      case 'custom':
        return `${baseUrl}/custom?invite=${linkCode}&params=${encodeURIComponent(data.customParams)}`;
      default:
        return `${baseUrl}?invite=${linkCode}`;
    }
  }

  /**
   * 生成二维码
   */
  private async generateQrCode(linkUrl: string): Promise<string> {
    // 这里应该调用二维码生成服务
    // 简化实现，返回占位符
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkUrl)}`;
  }

  /**
   * 生成海报
   */
  private async generatePoster(linkCode: string, data: any): Promise<string> {
    // 这里应该调用海报生成服务
    // 简化实现，返回占位符
    return `https://via.placeholder.com/300x400/4CAF50/FFFFFF?text=推广海报-${linkCode}`;
  }

  /**
   * 获取推广链接详情
   */
  async getDistributionLinkById(id: string): Promise<DistributionLink> {
    const link = await this.distributionLinkRepository.findOne({
      where: { id },
      relations: ['distribution', 'distribution.member'],
    });
    if (!link) {
      throw new ApiException(ErrorCode.DISTRIBUTION_LINK_NOT_FOUND);
    }

    return link;
  }

  /**
   * 根据链接码获取推广链接
   */
  async getDistributionLinkByCode(linkCode: string): Promise<DistributionLink> {
    const link = await this.distributionLinkRepository.findOne({
      where: { linkCode, status: 'active' },
      relations: ['distribution'],
    });
    if (!link) {
      throw new ApiException(ErrorCode.DISTRIBUTION_LINK_NOT_FOUND);
    }

    // 检查是否过期
    if (link.expireTime && new Date() > link.expireTime) {
      throw new ApiException(ErrorCode.DISTRIBUTION_LINK_EXPIRED);
    }

    return link;
  }

  /**
   * 更新点击统计
   */
  async updateClickStats(linkCode: string, ip?: string): Promise<DistributionLink> {
    const link = await this.getDistributionLinkByCode(linkCode);
    
    return await this.dataSource.transaction(async manager => {
      // 更新点击次数
      await manager.increment(DistributionLink, { id: link.id }, 'clickCount', 1);
      
      // 更新最后点击时间
      await manager.update(DistributionLink, { id: link.id }, {
        lastClickTime: new Date(),
      });

      // 重新获取更新后的数据
      const updatedLink = await manager.findOne(DistributionLink, {
        where: { id: link.id },
      });

      // 计算转化率
      if (updatedLink.clickCount > 0) {
        const convertRate = (updatedLink.orderCount / updatedLink.clickCount) * 100;
        await manager.update(DistributionLink, { id: link.id }, {
          convertRate: Math.round(convertRate * 100) / 100,
        });
      }

      return updatedLink;
    });
  }

  /**
   * 更新订单统计
   */
  async updateOrderStats(linkCode: string, orderAmount: number, commissionAmount: number): Promise<void> {
    const link = await this.getDistributionLinkByCode(linkCode);
    
    await this.dataSource.transaction(async manager => {
      // 更新订单统计
      await manager.increment(DistributionLink, { id: link.id }, 'orderCount', 1);
      await manager.increment(DistributionLink, { id: link.id }, 'orderAmount', orderAmount);
      await manager.increment(DistributionLink, { id: link.id }, 'commissionAmount', commissionAmount);

      // 重新获取更新后的数据
      const updatedLink = await manager.findOne(DistributionLink, {
        where: { id: link.id },
      });

      // 计算转化率
      if (updatedLink.clickCount > 0) {
        const convertRate = (updatedLink.orderCount / updatedLink.clickCount) * 100;
        await manager.update(DistributionLink, { id: link.id }, {
          convertRate: Math.round(convertRate * 100) / 100,
        });
      }
    });
  }

  /**
   * 获取分销员的推广链接列表
   */
  async getDistributionLinkList(
    distributionId: string,
    page: number = 1,
    limit: number = 10,
    linkType?: string,
    status?: string,
  ): Promise<[DistributionLink[], number]> {
    const queryBuilder = this.distributionLinkRepository
      .createQueryBuilder('link')
      .where('link.distributionId = :distributionId', { distributionId });

    if (linkType) {
      queryBuilder.andWhere('link.linkType = :linkType', { linkType });
    }

    if (status) {
      queryBuilder.andWhere('link.status = :status', { status });
    }

    queryBuilder
      .orderBy('link.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取所有推广链接列表（管理员）
   */
  async getAllDistributionLinkList(
    page: number = 1,
    limit: number = 10,
    linkType?: string,
    status?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<[DistributionLink[], number]> {
    const queryBuilder = this.distributionLinkRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.distribution', 'distribution')
      .leftJoinAndSelect('distribution.member', 'member');

    if (linkType) {
      queryBuilder.andWhere('link.linkType = :linkType', { linkType });
    }

    if (status) {
      queryBuilder.andWhere('link.status = :status', { status });
    }

    if (startTime) {
      queryBuilder.andWhere('link.createTime >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('link.createTime <= :endTime', { endTime });
    }

    queryBuilder
      .orderBy('link.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 更新推广链接
   */
  async updateDistributionLink(id: string, data: Partial<DistributionLink>): Promise<DistributionLink> {
    const link = await this.distributionLinkRepository.findOne({
      where: { id },
    });
    if (!link) {
      throw new ApiException(ErrorCode.DISTRIBUTION_LINK_NOT_FOUND);
    }

    // 如果修改了关键信息，重新生成链接
    if (data.linkType || data.productId || data.activityId || data.customParams) {
      const updatedData = { ...link, ...data };
      const linkUrl = await this.generateLinkUrl(link.linkCode, updatedData);
      const qrCodeUrl = await this.generateQrCode(linkUrl);
      
      data.linkUrl = linkUrl;
      data.qrCodeUrl = qrCodeUrl;
    }

    Object.assign(link, data);
    return await this.distributionLinkRepository.save(link);
  }

  /**
   * 启用/禁用推广链接
   */
  async toggleLinkStatus(id: string, status: 'active' | 'inactive'): Promise<DistributionLink> {
    const link = await this.distributionLinkRepository.findOne({
      where: { id },
    });
    if (!link) {
      throw new ApiException(ErrorCode.DISTRIBUTION_LINK_NOT_FOUND);
    }

    link.status = status;
    return await this.distributionLinkRepository.save(link);
  }

  /**
   * 删除推广链接
   */
  async deleteDistributionLink(id: string): Promise<void> {
    const link = await this.distributionLinkRepository.findOne({
      where: { id },
    });
    if (!link) {
      throw new ApiException(ErrorCode.DISTRIBUTION_LINK_NOT_FOUND);
    }

    await this.distributionLinkRepository.remove(link);
  }

  /**
   * 获取热门推广链接
   */
  async getHotDistributionLinks(limit: number = 10): Promise<DistributionLink[]> {
    return await this.distributionLinkRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.distribution', 'distribution')
      .leftJoinAndSelect('distribution.member', 'member')
      .where('link.status = :status', { status: 'active' })
      .andWhere('link.orderCount > 0')
      .orderBy('link.orderCount', 'DESC')
      .addOrderBy('link.clickCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 获取推广链接统计
   */
  async getLinkStats(distributionId?: string): Promise<{
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    totalOrders: number;
    totalOrderAmount: number;
    totalCommission: number;
    avgConvertRate: number;
  }> {
    const queryBuilder = this.distributionLinkRepository
      .createQueryBuilder('link')
      .select([
        'COUNT(*) as totalLinks',
        'SUM(CASE WHEN link.status = "active" THEN 1 ELSE 0 END) as activeLinks',
        'SUM(link.clickCount) as totalClicks',
        'SUM(link.orderCount) as totalOrders',
        'SUM(link.orderAmount) as totalOrderAmount',
        'SUM(link.commissionAmount) as totalCommission',
        'AVG(link.convertRate) as avgConvertRate',
      ]);

    if (distributionId) {
      queryBuilder.andWhere('link.distributionId = :distributionId', { distributionId });
    }

    const result = await queryBuilder.getRawOne();

    return {
      totalLinks: parseInt(result.totalLinks) || 0,
      activeLinks: parseInt(result.activeLinks) || 0,
      totalClicks: parseInt(result.totalClicks) || 0,
      totalOrders: parseInt(result.totalOrders) || 0,
      totalOrderAmount: parseFloat(result.totalOrderAmount) || 0,
      totalCommission: parseFloat(result.totalCommission) || 0,
      avgConvertRate: parseFloat(result.avgConvertRate) || 0,
    };
  }

  /**
   * 获取过期链接
   */
  async getExpiredLinks(): Promise<DistributionLink[]> {
    const now = new Date();
    return await this.distributionLinkRepository
      .createQueryBuilder('link')
      .where('link.status = :status', { status: 'active' })
      .andWhere('link.expireTime < :now', { now })
      .getMany();
  }

  /**
   * 批量禁用过期链接
   */
  async disableExpiredLinks(): Promise<void> {
    const now = new Date();
    await this.distributionLinkRepository
      .createQueryBuilder()
      .update(DistributionLink)
      .set({ status: 'inactive' })
      .where('status = :status', { status: 'active' })
      .andWhere('expireTime < :now', { now })
      .execute();
  }

  /**
   * 获取推广链接转化排行榜
   */
  async getLinkRanking(type: 'clicks' | 'orders' | 'commission' = 'orders', limit: number = 10): Promise<any[]> {
    const orderByMap = {
      clicks: 'link.clickCount',
      orders: 'link.orderCount',
      commission: 'link.commissionAmount',
    };

    return await this.distributionLinkRepository
      .createQueryBuilder('link')
      .leftJoin('link.distribution', 'distribution')
      .leftJoin('distribution.member', 'member')
      .select([
        'link.id',
        'link.linkCode',
        'link.linkTitle',
        'link.clickCount',
        'link.orderCount',
        'link.orderAmount',
        'link.commissionAmount',
        'link.convertRate',
        'distribution.distributionCode',
        'member.nickname',
      ])
      .where('link.status = :status', { status: 'active' })
      .andWhere('link.orderCount > 0')
      .orderBy(orderByMap[type], 'DESC')
      .limit(limit)
      .getMany();
  }
}