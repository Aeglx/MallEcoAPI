import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { WechatFans } from '../entities/wechat-fans.entity';
import { CreateWechatFansDto } from '../dto/create-wechat-fans.dto';
import { UpdateWechatFansDto } from '../dto/update-wechat-fans.dto';
import { QueryWechatFansDto } from '../dto/query-wechat-fans.dto';

@Injectable()
export class WechatFansService {
  constructor(
    @InjectRepository(WechatFans)
    private readonly wechatFansRepository: Repository<WechatFans>,
  ) {}

  /**
   * 创建粉丝
   */
  async create(createWechatFansDto: CreateWechatFansDto): Promise<WechatFans> {
    const existingFans = await this.wechatFansRepository.findOne({
      where: { openid: createWechatFansDto.openid },
    });

    if (existingFans) {
      throw new BadRequestException('该粉丝已存在');
    }

    const fans = this.wechatFansRepository.create(createWechatFansDto);
    return await this.wechatFansRepository.save(fans);
  }

  /**
   * 分页查询粉丝列表
   */
  async findAll(queryWechatFansDto: QueryWechatFansDto) {
    const {
      page = 1,
      pageSize = 10,
      nickname,
      subscribeStatus,
      sex,
      city,
      blacklist,
      startTime,
      endTime,
    } = queryWechatFansDto;

    const queryBuilder = this.wechatFansRepository.createQueryBuilder('fans');

    // 搜索条件
    if (nickname) {
      queryBuilder.andWhere('fans.nickname LIKE :nickname', { nickname: `%${nickname}%` });
    }

    if (subscribeStatus !== undefined) {
      queryBuilder.andWhere('fans.subscribeStatus = :subscribeStatus', { subscribeStatus });
    }

    if (sex !== undefined) {
      queryBuilder.andWhere('fans.sex = :sex', { sex });
    }

    if (city) {
      queryBuilder.andWhere('fans.city LIKE :city', { city: `%${city}%` });
    }

    if (blacklist !== undefined) {
      queryBuilder.andWhere('fans.blacklist = :blacklist', { blacklist });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('fans.subscribeTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    }

    // 排序
    queryBuilder.orderBy('fans.createTime', 'DESC');

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
   * 根据ID查询粉丝
   */
  async findOne(id: string): Promise<WechatFans> {
    const fans = await this.wechatFansRepository.findOne({ where: { id } });
    if (!fans) {
      throw new NotFoundException('粉丝不存在');
    }
    return fans;
  }

  /**
   * 根据openid查询粉丝
   */
  async findByOpenid(openid: string): Promise<WechatFans> {
    const fans = await this.wechatFansRepository.findOne({ where: { openid } });
    if (!fans) {
      throw new NotFoundException('粉丝不存在');
    }
    return fans;
  }

  /**
   * 更新粉丝信息
   */
  async update(id: string, updateWechatFansDto: UpdateWechatFansDto): Promise<WechatFans> {
    const fans = await this.findOne(id);
    
    Object.assign(fans, updateWechatFansDto);
    return await this.wechatFansRepository.save(fans);
  }

  /**
   * 删除粉丝
   */
  async remove(id: string): Promise<void> {
    const fans = await this.findOne(id);
    await this.wechatFansRepository.remove(fans);
  }

  /**
   * 批量更新粉丝标签
   */
  async batchUpdateTags(ids: string[], tagIds: number[]): Promise<void> {
    await this.wechatFansRepository.update(ids, { tagIds });
  }

  /**
   * 批量加入/移除黑名单
   */
  async batchUpdateBlacklist(ids: string[], blacklist: number): Promise<void> {
    await this.wechatFansRepository.update(ids, { blacklist });
  }

  /**
   * 更新关注状态
   */
  async updateSubscribeStatus(openid: string, subscribeStatus: number): Promise<void> {
    const updateTime = subscribeStatus === 1 ? 
      { subscribeTime: new Date(), unsubscribeTime: null } : 
      { unsubscribeTime: new Date() };

    await this.wechatFansRepository.update({ openid }, { 
      subscribeStatus, 
      ...updateTime 
    });
  }

  /**
   * 获取粉丝统计信息
   */
  async getFansStats(): Promise<any> {
    const total = await this.wechatFansRepository.count();
    const subscribed = await this.wechatFansRepository.count({ 
      where: { subscribeStatus: 1 } 
    });
    const unsubscribed = await this.wechatFansRepository.count({ 
      where: { subscribeStatus: 0 } 
    });
    const blacklisted = await this.wechatFansRepository.count({ 
      where: { blacklist: 1 } 
    });

    // 今日新增
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNew = await this.wechatFansRepository.count({
      where: {
        createTime: Between(today, new Date()),
      },
    });

    return {
      total,
      subscribed,
      unsubscribed,
      blacklisted,
      todayNew,
      subscribeRate: total > 0 ? (subscribed / total * 100).toFixed(2) : 0,
    };
  }

  /**
   * 同步粉丝信息
   */
  async syncFansInfo(openid: string): Promise<void> {
    // 这里可以调用微信API同步粉丝信息
    // 实际实现需要集成微信SDK
    console.log(`同步粉丝信息: ${openid}`);
  }
}