import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Product } from '../../../modules/common/product/entities/product.entity';

@Injectable()
export class ProductTaskService {
  private readonly logger = new Logger(ProductTaskService.name);

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  /**
   * 每天凌晨4点检查产品库存和状态
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async checkProductStatus() {
    this.logger.debug('开始检查产品库存和状态');
    try {
      // 可以在这里添加实际需要的产品检查逻辑
      this.logger.debug('产品库存和状态检查完成');
    } catch (error) {
      this.logger.error('检查产品库存和状态失败', error.stack);
    }
  }

  /**
   * 每天凌晨5点更新产品库存预警
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async updateProductStockAlert() {
    this.logger.debug('开始更新产品库存预警');
    try {
      // 查找库存低于预警值的产品
      const lowStockProducts = await this.productRepository.find({
        where: {
          isShow: 1, // 假设1表示上架
          stock: LessThan(50), // 假设预警值为50
        },
      });

      if (lowStockProducts.length > 0) {
        // 这里可以实现库存预警逻辑，例如发送邮件或消息给管理员
        this.logger.debug(`发现 ${lowStockProducts.length} 个库存不足的产品`);
      } else {
        this.logger.debug('没有发现库存不足的产品');
      }
    } catch (error) {
      this.logger.error('更新产品库存预警失败', error.stack);
    }
  }

  /**
   * 每天凌晨6点统计热门产品和滞销产品
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async updateProductStatistics() {
    this.logger.debug('开始更新产品统计数据');
    try {
      // 统计热门产品（销量前100）
      const hotProducts = await this.productRepository.find({
        where: {
          isShow: 1, // 假设1表示上架
        },
        order: {
          sales: 'DESC',
        },
        take: 100,
      });

      // 统计滞销产品（销量为0且库存大于0）
      const unsoldProducts = await this.productRepository.find({
        where: {
          isShow: 1, // 假设1表示上架
          sales: 0,
          stock: MoreThan(0),
        },
      });

      this.logger.debug(`统计完成：热门产品 ${hotProducts.length} 个，滞销产品 ${unsoldProducts.length} 个`);
    } catch (error) {
      this.logger.error('更新产品统计数据失败', error.stack);
    }
  }

  /**
   * 每月1号凌晨7点检查需要下架的产品
   */
  @Cron('0 0 7 1 * *')
  async checkProductsToTakeDown() {
    this.logger.debug('开始检查需要下架的产品');
    try {
      // 这里可以添加实际需要下架的产品检查逻辑
      this.logger.debug('需要下架的产品检查完成');
    } catch (error) {
      this.logger.error('检查需要下架的产品失败', error.stack);
    }
  }
}
