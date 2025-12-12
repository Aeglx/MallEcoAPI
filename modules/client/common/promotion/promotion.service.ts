import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionType, PromotionStatus } from './entities/promotion.entity';
import { PromotionProduct } from './entities/promotion-product.entity';
import { PromotionMember } from './entities/promotion-member.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion) private promotionRepository: Repository<Promotion>,
    @InjectRepository(PromotionProduct) private promotionProductRepository: Repository<PromotionProduct>,
    @InjectRepository(PromotionMember) private promotionMemberRepository: Repository<PromotionMember>,
    private productService: ProductService,
  ) {}

  /**
   * 创建促销活动
   * @param createPromotionDto 创建促销活动DTO
   * @returns 创建的促销活动
   */
  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    // 验证促销时间
    if (createPromotionDto.startTime >= createPromotionDto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // 检查促销商品是否存在
    if (createPromotionDto.promotionProducts && createPromotionDto.promotionProducts.length > 0) {
      for (const item of createPromotionDto.promotionProducts) {
        const product = await this.productService.findOne(item.productId);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
      }
    }

    // 创建促销活动
    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      promotionStatus: PromotionStatus.NOT_STARTED,
      usedStock: 0,
    });

    const savedPromotion = await this.promotionRepository.save(promotion);

    // 处理关联商品
    if (createPromotionDto.promotionProducts && createPromotionDto.promotionProducts.length > 0) {
      for (const item of createPromotionDto.promotionProducts) {
        await this.promotionProductRepository.save({
          promotionId: savedPromotion.id,
          productId: item.productId,
          skuId: item.skuId || '',
          promotionPrice: item.promotionPrice || 0,
          stock: item.stock || 0,
          isMain: item.isMain || false,
        });
      }
    }

    // 处理关联会员
    if (createPromotionDto.promotionMembers && createPromotionDto.promotionMembers.length > 0) {
      for (const item of createPromotionDto.promotionMembers) {
        await this.promotionMemberRepository.save({
          promotionId: savedPromotion.id,
          memberId: item.memberId,
          maxParticipate: item.maxParticipate || 1,
        });
      }
    }

    return savedPromotion;
  }

  /**
   * 查询促销活动列表
   * @returns 促销活动列表
   */
  async findAll(): Promise<Promotion[]> {
    return await this.promotionRepository.find({
      relations: ['promotionProducts', 'promotionMembers'],
      order: { startTime: 'DESC' },
    });
  }

  /**
   * 根据ID查询促销活动
   * @param id 促销活动ID
   * @returns 促销活动
   */
  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['promotionProducts', 'promotionMembers'],
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  /**
   * 更新促销活动
   * @param id 促销活动ID
   * @param updatePromotionDto 更新促销活动DTO
   * @returns 更新后的促销活动
   */
  async update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);

    // 验证促销时间
    if (updatePromotionDto.startTime && updatePromotionDto.endTime && updatePromotionDto.startTime >= updatePromotionDto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // 更新促销活动信息
    Object.assign(promotion, updatePromotionDto);

    return await this.promotionRepository.save(promotion);
  }

  /**
   * 删除促销活动
   * @param id 促销活动ID
   * @returns 删除结果
   */
  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }

  /**
   * 暂停促销活动
   * @param id 促销活动ID
   * @returns 暂停后的促销活动
   */
  async pausePromotion(id: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.promotionStatus = PromotionStatus.PAUSED;
    return await this.promotionRepository.save(promotion);
  }

  /**
   * 恢复促销活动
   * @param id 促销活动ID
   * @returns 恢复后的促销活动
   */
  async resumePromotion(id: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    const now = new Date();
    
    if (now < promotion.startTime) {
      promotion.promotionStatus = PromotionStatus.NOT_STARTED;
    } else if (now > promotion.endTime) {
      promotion.promotionStatus = PromotionStatus.ENDED;
    } else {
      promotion.promotionStatus = PromotionStatus.ONGOING;
    }
    
    return await this.promotionRepository.save(promotion);
  }

  /**
   * 检查并更新促销活动状态
   * @param promotion 促销活动
   * @returns 更新后的促销活动
   */
  async checkPromotionStatus(promotion: Promotion): Promise<Promotion> {
    const now = new Date();
    let statusChanged = false;

    if (now < promotion.startTime && promotion.promotionStatus !== PromotionStatus.NOT_STARTED) {
      promotion.promotionStatus = PromotionStatus.NOT_STARTED;
      statusChanged = true;
    } else if (now >= promotion.startTime && now <= promotion.endTime && promotion.promotionStatus !== PromotionStatus.ONGOING) {
      promotion.promotionStatus = PromotionStatus.ONGOING;
      statusChanged = true;
    } else if (now > promotion.endTime && promotion.promotionStatus !== PromotionStatus.ENDED) {
      promotion.promotionStatus = PromotionStatus.ENDED;
      statusChanged = true;
    }

    if (statusChanged) {
      return await this.promotionRepository.save(promotion);
    }

    return promotion;
  }

  /**
   * 根据商品ID查询促销活动
   * @param productId 商品ID
   * @param promotionType 促销类型
   * @returns 促销活动列表
   */
  async findByProductId(productId: string, promotionType?: PromotionType): Promise<Promotion[]> {
    const query = this.promotionRepository.createQueryBuilder('promotion')
      .innerJoin('promotion.promotionProducts', 'promotionProduct')
      .where('promotionProduct.productId = :productId', { productId })
      .andWhere('promotion.promotionStatus IN (:...statuses)', { 
        statuses: [PromotionStatus.ONGOING, PromotionStatus.NOT_STARTED] 
      });

    if (promotionType) {
      query.andWhere('promotion.promotionType = :promotionType', { promotionType });
    }

    return await query.getMany();
  }

  /**
   * 根据类型查询促销活动
   * @param promotionType 促销类型
   * @returns 促销活动列表
   */
  async findByType(promotionType: PromotionType): Promise<Promotion[]> {
    return await this.promotionRepository.find({
      where: { promotionType, promotionStatus: PromotionStatus.ONGOING },
      relations: ['promotionProducts'],
    });
  }

  /**
   * 应用促销规则计算优惠
   * @param promotion 促销活动
   * @param orderAmount 订单金额
   * @param productInfo 商品信息
   * @returns 优惠金额
   */
  calculateDiscount(promotion: Promotion, orderAmount: number, productInfo?: any): number {
    let discountAmount = 0;

    switch (promotion.promotionType) {
      case PromotionType.FULL_REDUCTION:
        // 满减
        if (orderAmount >= promotion.minAmount) {
          discountAmount = promotion.reductionAmount;
        }
        break;

      case PromotionType.DISCOUNT:
        // 折扣
        if (orderAmount >= promotion.minAmount) {
          const discount = orderAmount * (1 - promotion.discountRate);
          if (promotion.maxDiscount && discount > promotion.maxDiscount) {
            discountAmount = promotion.maxDiscount;
          } else {
            discountAmount = discount;
          }
        }
        break;

      case PromotionType.FLASH_SALE:
        // 秒杀
        if (productInfo) {
          const promotionProduct = promotion.promotionProducts.find(
            item => item.productId === productInfo.productId
          );
          if (promotionProduct) {
            discountAmount = productInfo.originalPrice - promotionProduct.promotionPrice;
          }
        }
        break;

      case PromotionType.GROUP_BUY:
        // 团购
        if (productInfo && productInfo.buyCount >= promotion.minAmount) {
          const promotionProduct = promotion.promotionProducts.find(
            item => item.productId === productInfo.productId
          );
          if (promotionProduct) {
            discountAmount = productInfo.originalPrice - promotionProduct.promotionPrice;
          }
        }
        break;

      default:
        discountAmount = 0;
    }

    return Math.max(discountAmount, 0);
  }
}
