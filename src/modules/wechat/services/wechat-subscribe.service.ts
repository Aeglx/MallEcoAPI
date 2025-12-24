import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { WechatSubscribe } from '../entities/wechat-subscribe.entity';
import { CreateWechatSubscribeDto } from '../dto/create-wechat-subscribe.dto';
import { UpdateWechatSubscribeDto } from '../dto/update-wechat-subscribe.dto';
import { QueryWechatSubscribeDto } from '../dto/query-wechat-subscribe.dto';

@Injectable()
export class WechatSubscribeService {
  constructor(
    @InjectRepository(WechatSubscribe)
    private readonly wechatSubscribeRepository: Repository<WechatSubscribe>,
  ) {}

  /**
   * 创建订阅
   */
  async create(createWechatSubscribeDto: CreateWechatSubscribeDto): Promise<WechatSubscribe> {
    const subscribe = this.wechatSubscribeRepository.create(createWechatSubscribeDto);
    return await this.wechatSubscribeRepository.save(subscribe);
  }

  /**
   * 分页查询订阅列表
   */
  async findAll(queryWechatSubscribeDto: QueryWechatSubscribeDto) {
    const {
      page = 1,
      pageSize = 10,
      openid,
      templateId,
      status,
      scene,
      businessType,
      startTime,
      endTime,
    } = queryWechatSubscribeDto;

    const queryBuilder = this.wechatSubscribeRepository.createQueryBuilder('subscribe');

    // 搜索条件
    if (openid) {
      queryBuilder.andWhere('subscribe.openid LIKE :openid', { openid: `%${openid}%` });
    }

    if (templateId) {
      queryBuilder.andWhere('subscribe.templateId LIKE :templateId', { 
        templateId: `%${templateId}%` 
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('subscribe.status = :status', { status });
    }

    if (scene) {
      queryBuilder.andWhere('subscribe.scene LIKE :scene', { scene: `%${scene}%` });
    }

    if (businessType) {
      queryBuilder.andWhere('subscribe.businessType LIKE :businessType', { 
        businessType: `%${businessType}%` 
      });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('subscribe.createTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    }

    // 排序
    queryBuilder.orderBy('subscribe.createTime', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询订阅
   */
  async findOne(id: string): Promise<WechatSubscribe> {
    const subscribe = await this.wechatSubscribeRepository.findOne({ where: { id } });
    if (!subscribe) {
      throw new NotFoundException('订阅记录不存在');
    }
    return subscribe;
  }

  /**
   * 更新订阅
   */
  async update(id: string, updateWechatSubscribeDto: UpdateWechatSubscribeDto): Promise<WechatSubscribe> {
    const subscribe = await this.findOne(id);
    
    Object.assign(subscribe, updateWechatSubscribeDto);
    return await this.wechatSubscribeRepository.save(subscribe);
  }

  /**
   * 删除订阅
   */
  async remove(id: string): Promise<void> {
    const subscribe = await this.findOne(id);
    await this.wechatSubscribeRepository.remove(subscribe);
  }

  /**
   * 发送订阅消息
   */
  async sendSubscribeMessage(subscribeData: {
    openid: string;
    templateId: string;
    data: any;
    url?: string;
    miniprogram?: {
      appid: string;
      pagepath: string;
    };
    scene?: string;
  }): Promise<any> {
    // 这里应该调用微信API发送订阅消息
    // 实际实现需要集成微信SDK
    console.log('发送订阅消息:', subscribeData);

    // 创建订阅记录
    const createDto = {
      openid: subscribeData.openid,
      templateId: subscribeData.templateId,
      scene: subscribeData.scene || '',
      status: 1, // 已订阅
      content: JSON.stringify(subscribeData.data),
      templateData: subscribeData.data,
      createById: 'system',
      updateById: 'system',
    };

    const subscribe = await this.create(createDto);

    // 模拟发送成功
    return {
      success: true,
      messageId: subscribe.id,
      message: '订阅消息发送成功',
    };
  }

  /**
   * 批量发送订阅消息
   */
  async batchSendSubscribeMessage(messages: any[]): Promise<any> {
    const results = [];
    for (const message of messages) {
      try {
        const result = await this.sendSubscribeMessage(message);
        results.push({ ...message, ...result, success: true });
      } catch (error) {
        results.push({ ...message, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return {
      total: results.length,
      successCount,
      failCount,
      results,
    };
  }

  /**
   * 更新发送状态
   */
  async updateSendStatus(id: string, status: number, errorMessage?: string): Promise<void> {
    const updateData: any = {
      status,
      sendTime: status === 3 ? new Date() : null,
      errorMessage: errorMessage || null,
    };

    if (status === 1) { // 发送失败，增加重试次数
      updateData.retryCount = () => 'retryCount + 1';
      updateData.nextRetryTime = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后重试
    }

    await this.wechatSubscribeRepository.update(id, updateData);
  }

  /**
   * 记录点击事件
   */
  async recordClick(id: string, clickUrl: string): Promise<void> {
    await this.wechatSubscribeRepository.update(id, {
      status: 3, // 已发送且点击
      clickTime: new Date(),
      clickUrl,
    });
  }

  /**
   * 获取订阅统计
   */
  async getSubscribeStats(): Promise<any> {
    const total = await this.wechatSubscribeRepository.count();
    const subscribed = await this.wechatSubscribeRepository.count({ 
      where: { status: 1 } 
    });
    const refused = await this.wechatSubscribeRepository.count({ 
      where: { status: 2 } 
    });
    const sent = await this.wechatSubscribeRepository.count({ 
      where: { status: 3 } 
    });

    // 今日发送
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySent = await this.wechatSubscribeRepository.count({
      where: {
        sendTime: Between(today, new Date()),
      },
    });

    return {
      total,
      subscribed,
      refused,
      sent,
      todaySent,
      subscribeRate: total > 0 ? (subscribed / total * 100).toFixed(2) : 0,
      sendRate: subscribed > 0 ? (sent / subscribed * 100).toFixed(2) : 0,
    };
  }

  /**
   * 获取重试列表
   */
  async getRetryList(): Promise<WechatSubscribe[]> {
    return await this.wechatSubscribeRepository.find({
      where: {
        status: 1, // 订阅状态
        retryCount: 3, // 小于3次重试
        nextRetryTime: Between(new Date(), new Date(Date.now() + 60 * 1000)), // 1分钟内需要重试
      },
      order: {
        nextRetryTime: 'ASC',
      },
    });
  }
}