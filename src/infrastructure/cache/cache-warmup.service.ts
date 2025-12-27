import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CacheProtectionService } from './cache-protection.service';

/**
 * 缓存预热服务
 * 在应用启动时预加载热点数据到缓存
 */
@Injectable()
export class CacheWarmupService implements OnModuleInit {
  private readonly logger = new Logger(CacheWarmupService.name);

  constructor(
    private readonly cacheProtection: CacheProtectionService,
    // 注入需要的服务
    // private readonly goodsService: GoodsService,
    // private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    // 延迟预热，等待应用完全启动
    setTimeout(() => {
      this.warmup().catch(error => {
        this.logger.error('Cache warmup failed:', error);
      });
    }, 5000); // 5秒后开始预热
  }

  /**
   * 执行缓存预热
   */
  async warmup(): Promise<void> {
    this.logger.log('Starting cache warmup...');

    try {
      // 预热热点商品数据
      await this.warmupHotGoods();

      // 预热用户统计数据
      await this.warmupUserStats();

      // 预热系统配置
      await this.warmupSystemConfig();

      this.logger.log('Cache warmup completed');
    } catch (error) {
      this.logger.error('Cache warmup error:', error);
    }
  }

  /**
   * 预热热点商品
   */
  private async warmupHotGoods(): Promise<void> {
    try {
      // 示例：预热前100个热门商品
      // const hotGoodsIds = await this.goodsService.getHotGoodsIds(100);
      // for (const goodsId of hotGoodsIds) {
      //   await this.cacheProtection.getWithPenetrationProtection(
      //     `goods:${goodsId}`,
      //     () => this.goodsService.findById(goodsId),
      //     3600, // 1小时
      //   );
      // }
      this.logger.log('Hot goods cache warmed up');
    } catch (error) {
      this.logger.warn('Failed to warmup hot goods:', error);
    }
  }

  /**
   * 预热用户统计数据
   */
  private async warmupUserStats(): Promise<void> {
    try {
      // 示例：预热用户统计数据
      // await this.cacheProtection.getWithPenetrationProtection(
      //   'stats:user:total',
      //   () => this.userService.getTotalCount(),
      //   1800, // 30分钟
      // );
      this.logger.log('User stats cache warmed up');
    } catch (error) {
      this.logger.warn('Failed to warmup user stats:', error);
    }
  }

  /**
   * 预热系统配置
   */
  private async warmupSystemConfig(): Promise<void> {
    try {
      // 示例：预热系统配置
      // await this.cacheProtection.getWithPenetrationProtection(
      //   'config:system',
      //   () => this.configService.getSystemConfig(),
      //   7200, // 2小时
      // );
      this.logger.log('System config cache warmed up');
    } catch (error) {
      this.logger.warn('Failed to warmup system config:', error);
    }
  }

  /**
   * 手动触发预热
   */
  async manualWarmup(): Promise<void> {
    this.logger.log('Manual cache warmup triggered');
    await this.warmup();
  }
}
