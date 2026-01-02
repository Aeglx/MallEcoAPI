import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WechatFans } from './entities/wechat-fans.entity';
import { WechatTemplate } from './entities/wechat-template.entity';
import { WechatMaterialImage } from './entities/wechat-material-image.entity';
import { WechatMaterialVideo } from './entities/wechat-material-video.entity';
import { WechatMaterialVoice } from './entities/wechat-material-voice.entity';
import { WechatMaterialArticle } from './entities/wechat-material-article.entity';
import { WechatCoupon } from './entities/wechat-coupon.entity';
import { WechatMenu } from './entities/wechat-menu.entity';

@Injectable()
export class WechatService {
  constructor(
    @InjectRepository(WechatFans)
    private readonly wechatFansRepository: Repository<WechatFans>,
    @InjectRepository(WechatTemplate)
    private readonly wechatTemplateRepository: Repository<WechatTemplate>,
    @InjectRepository(WechatMaterialImage)
    private readonly materialImageRepository: Repository<WechatMaterialImage>,
    @InjectRepository(WechatMaterialVideo)
    private readonly materialVideoRepository: Repository<WechatMaterialVideo>,
    @InjectRepository(WechatMaterialVoice)
    private readonly materialVoiceRepository: Repository<WechatMaterialVoice>,
    @InjectRepository(WechatMaterialArticle)
    private readonly materialArticleRepository: Repository<WechatMaterialArticle>,
    @InjectRepository(WechatCoupon)
    private readonly wechatCouponRepository: Repository<WechatCoupon>,
    @InjectRepository(WechatMenu)
    private readonly wechatMenuRepository: Repository<WechatMenu>,
  ) {}

  /**
   * 获取公众号概览信息
   */
  async getOverview() {
    try {
      const [
        fansCount,
        templateCount,
        materialImageCount,
        materialVideoCount,
        materialVoiceCount,
        materialArticleCount,
        couponCount,
        menuCount,
      ] = await Promise.all([
        this.wechatFansRepository.count({ where: { subscribeStatus: 1 } }),
        this.wechatTemplateRepository.count({ where: { status: 1 } }),
        this.materialImageRepository.count(),
        this.materialVideoRepository.count(),
        this.materialVoiceRepository.count(),
        this.materialArticleRepository.count(),
        this.wechatCouponRepository.count(),
        this.wechatMenuRepository.count({ where: { status: 1 } }),
      ]);

      const materialCount = materialImageCount + materialVideoCount + materialVoiceCount + materialArticleCount;

      // 获取最后同步时间（粉丝最后更新时间）
      const lastFansUpdate = await this.wechatFansRepository
        .createQueryBuilder('fans')
        .select('MAX(fans.updateTime)', 'lastSyncTime')
        .getRawOne();

      return {
        fansCount,
        templateCount,
        materialCount,
        couponCount,
        menuCount,
        menuStatus: menuCount > 0 ? 'configured' : 'not_configured',
        lastSyncTime: lastFansUpdate?.lastSyncTime || new Date(),
      };
    } catch (error) {
      console.error('获取公众号概览失败:', error);
      return {
        fansCount: 0,
        templateCount: 0,
        materialCount: 0,
        couponCount: 0,
        menuCount: 0,
        menuStatus: 'not_configured',
        lastSyncTime: new Date(),
      };
    }
  }

  /**
   * 获取公众号配置
   */
  async getConfig() {
    return {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      token: process.env.WECHAT_TOKEN || '',
      aesKey: process.env.WECHAT_AES_KEY || '',
      accessToken: '',
      expiresIn: 0,
    };
  }

  /**
   * 更新公众号配置
   */
  async updateConfig(configData: any) {
    // 这里应该将配置保存到数据库或配置文件
    // 暂时保存到环境变量（实际应该使用配置表）
    if (configData.appId) {
      process.env.WECHAT_APP_ID = configData.appId;
    }
    if (configData.appSecret) {
      process.env.WECHAT_APP_SECRET = configData.appSecret;
    }
    if (configData.token) {
      process.env.WECHAT_TOKEN = configData.token;
    }
    if (configData.aesKey) {
      process.env.WECHAT_AES_KEY = configData.aesKey;
    }
    return { success: true, message: '配置更新成功' };
  }

  /**
   * 获取公众号统计数据
   */
  async getStats() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 获取粉丝增长数据
      const [totalFans, dailyFans, weeklyFans, monthlyFans] = await Promise.all([
        this.wechatFansRepository.count({ where: { subscribeStatus: 1 } }),
        this.wechatFansRepository.count({
          where: {
            subscribeStatus: 1,
            subscribeTime: Between(today, now),
          },
        }),
        this.wechatFansRepository.count({
          where: {
            subscribeStatus: 1,
            subscribeTime: Between(weekAgo, now),
          },
        }),
        this.wechatFansRepository.count({
          where: {
            subscribeStatus: 1,
            subscribeTime: Between(monthAgo, now),
          },
        }),
      ]);

      // 获取模板消息统计数据
      const templates = await this.wechatTemplateRepository.find({
        where: { status: 1 },
      });

      const totalSent = templates.reduce((sum, t) => sum + (t.sendCount || 0), 0);
      const totalClick = templates.reduce((sum, t) => sum + (t.clickCount || 0), 0);
      const totalReceived = totalSent; // 假设发送数等于接收数

      // 获取素材统计数据
      const [
        imageCount,
        videoCount,
        voiceCount,
        articleCount,
      ] = await Promise.all([
        this.materialImageRepository.count(),
        this.materialVideoRepository.count(),
        this.materialVoiceRepository.count(),
        this.materialArticleRepository.count(),
      ]);

      return {
        fansStats: {
          total: totalFans,
          dailyGrowth: dailyFans,
          weeklyGrowth: weeklyFans,
          monthlyGrowth: monthlyFans,
        },
        dailyFansGrowth: dailyFans,
        weeklyFansGrowth: weeklyFans,
        monthlyFansGrowth: monthlyFans,
        messageStats: {
          sent: totalSent,
          received: totalReceived,
          failed: 0, // 需要根据实际发送结果统计
        },
        materialStats: {
          images: imageCount,
          videos: videoCount,
          voices: voiceCount,
          articles: articleCount,
        },
      };
    } catch (error) {
      console.error('获取公众号统计数据失败:', error);
      return {
        fansStats: {
          total: 0,
          dailyGrowth: 0,
          weeklyGrowth: 0,
          monthlyGrowth: 0,
        },
        dailyFansGrowth: 0,
        weeklyFansGrowth: 0,
        monthlyFansGrowth: 0,
        messageStats: {
          sent: 0,
          received: 0,
          failed: 0,
        },
        materialStats: {
          images: 0,
          videos: 0,
          voices: 0,
          articles: 0,
        },
      };
    }
  }
}
