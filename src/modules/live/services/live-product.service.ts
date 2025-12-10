import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveProduct } from '../entities/live-product.entity';

@Injectable()
export class LiveProductService {
  constructor(
    @InjectRepository(LiveProduct)
    private readonly liveProductRepository: Repository<LiveProduct>,
  ) {}

  /**
   * 添加商品到直播间
   */
  async addProductToRoom(roomId: string, productData: any): Promise<LiveProduct> {
    const liveProduct = this.liveProductRepository.create({
      ...productData,
      roomId,
      isActive: true,
      addedTime: new Date(),
    });

    return await this.liveProductRepository.save(liveProduct);
  }

  /**
   * 从直播间移除商品
   */
  async removeProductFromRoom(productId: string): Promise<void> {
    await this.liveProductRepository.update(productId, {
      isActive: false,
      removedTime: new Date(),
    });
  }

  /**
   * 获取直播间商品列表
   */
  async getRoomProducts(roomId: string): Promise<LiveProduct[]> {
    return await this.liveProductRepository.find({
      where: { roomId, isActive: true },
      order: { addedTime: 'DESC' },
    });
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: string): Promise<LiveProduct> {
    return await this.liveProductRepository.findOne({
      where: { id: productId },
    });
  }

  /**
   * 更新商品排序
   */
  async updateProductSort(roomId: string, productIds: string[]): Promise<void> {
    for (let i = 0; i < productIds.length; i++) {
      await this.liveProductRepository.update(
        { id: productIds[i], roomId },
        { sortOrder: i }
      );
    }
  }

  /**
   * 更新商品状态
   */
  async updateProductStatus(productId: string, isActive: boolean): Promise<void> {
    await this.liveProductRepository.update(productId, { isActive });
  }

  /**
   * 获取直播间热销商品
   */
  async getHotProducts(roomId: string, limit: number = 10): Promise<LiveProduct[]> {
    return await this.liveProductRepository.find({
      where: { roomId, isActive: true },
      order: { salesCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * 增加商品销量
   */
  async increaseProductSales(productId: string, quantity: number = 1): Promise<void> {
    await this.liveProductRepository.increment(
      { id: productId },
      'salesCount',
      quantity
    );
  }
}