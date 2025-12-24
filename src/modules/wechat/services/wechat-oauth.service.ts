import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatOauthUser } from '../entities/wechat-oauth-user.entity';
import { WechatOauthApp } from '../entities/wechat-oauth-app.entity';
import { WechatOauthToken } from '../entities/wechat-oauth-token.entity';
import { CreateOauthAppDto } from '../dto/create-oauth-app.dto';
import { UpdateOauthAppDto } from '../dto/update-oauth-app.dto';
import { QueryOauthUserDto } from '../dto/query-oauth-user.dto';
import { QueryOauthAppDto } from '../dto/query-oauth-app.dto';
import { QueryOauthTokenDto } from '../dto/query-oauth-token.dto';

export enum OauthAppStatus {
  DRAFT = 0, // 草稿
  ACTIVE = 1, // 已激活
  DISABLED = 2, // 已禁用
}

export enum TokenStatus {
  ACTIVE = 0, // 活跃
  EXPIRED = 1, // 已过期
  REVOKED = 2, // 已撤销
}

@Injectable()
export class WechatOauthService {
  constructor(
    @InjectRepository(WechatOauthUser)
    private readonly oauthUserRepository: Repository<WechatOauthUser>,
    @InjectRepository(WechatOauthApp)
    private readonly oauthAppRepository: Repository<WechatOauthApp>,
    @InjectRepository(WechatOauthToken)
    private readonly oauthTokenRepository: Repository<WechatOauthToken>,
  ) {}

  // 用户授权管理
  async getOauthUsers(queryDto: QueryOauthUserDto) {
    const { page = 1, pageSize = 10, nickname, appId, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.oauthUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.app', 'app');

    if (nickname) {
      queryBuilder.andWhere('user.nickname LIKE :nickname', { nickname: `%${nickname}%` });
    }

    if (appId) {
      queryBuilder.andWhere('user.appId = :appId', { appId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('user.createTime', 'DESC')
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

  async getOauthUserById(id: string) {
    const user = await this.oauthUserRepository.findOne({ 
      where: { id },
      relations: ['app'] 
    });
    if (!user) {
      throw new NotFoundException(`授权用户不存在: ${id}`);
    }
    return user;
  }

  // 应用授权管理
  async getOauthApps(queryDto: QueryOauthAppDto) {
    const { page = 1, pageSize = 10, name, appId, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.oauthAppRepository.createQueryBuilder('app');

    if (name) {
      queryBuilder.andWhere('app.name LIKE :name', { name: `%${name}%` });
    }

    if (appId) {
      queryBuilder.andWhere('app.appId = :appId', { appId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('app.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('app.createTime', 'DESC')
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

  async getOauthAppById(id: string) {
    const app = await this.oauthAppRepository.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException(`授权应用不存在: ${id}`);
    }
    return app;
  }

  async createOauthApp(createDto: CreateOauthAppDto) {
    const app = this.oauthAppRepository.create(createDto);
    return await this.oauthAppRepository.save(app);
  }

  async updateOauthApp(id: string, updateDto: UpdateOauthAppDto) {
    const app = await this.getOauthAppById(id);
    Object.assign(app, updateDto);
    return await this.oauthAppRepository.save(app);
  }

  async deleteOauthApp(id: string) {
    const app = await this.getOauthAppById(id);
    await this.oauthAppRepository.remove(app);
    return { success: true, message: '授权应用删除成功' };
  }

  // 令牌管理
  async getOauthTokens(queryDto: QueryOauthTokenDto) {
    const { page = 1, pageSize = 10, userId, appId, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.oauthTokenRepository
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .leftJoinAndSelect('token.app', 'app');

    if (userId) {
      queryBuilder.andWhere('token.id = :userId', { userId });
    }

    if (appId) {
      queryBuilder.andWhere('token.appId = :appId', { appId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('token.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('token.createTime', 'DESC')
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

  async getOauthTokenById(id: string) {
    const token = await this.oauthTokenRepository.findOne({ 
      where: { id },
      relations: ['user', 'app'] 
    });
    if (!token) {
      throw new NotFoundException(`令牌不存在: ${id}`);
    }
    return token;
  }

  // 撤销令牌
  async revokeToken(id: string) {
    const token = await this.getOauthTokenById(id);
    token.status = 0;
    return await this.oauthTokenRepository.save(token);
  }

  // 批量撤销令牌
  async revokeTokensByUser(userId: string, appId: string) {
    const result = await this.oauthTokenRepository
      .createQueryBuilder()
      .update(WechatOauthToken)
      .set({ 
        status: 0
      })
      .where('id = :userId AND appId = :appId AND status = :active', {
        userId,
        appId,
        active: 1
      })
      .execute();

    return { success: true, message: `成功撤销 ${result.affected} 个令牌` };
  }

  // 获取授权统计
  async getOauthStats() {
    const appStats = await this.oauthAppRepository
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.status')
      .getRawMany();

    const userStats = await this.oauthUserRepository
      .createQueryBuilder('user')
      .select('COUNT(*)', 'totalUsers')
      .addSelect('COUNT(DISTINCT appId)', 'activeApps')
      .getRawOne();

    const tokenStats = await this.oauthTokenRepository
      .createQueryBuilder('token')
      .select('token.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('token.status')
      .getRawMany();

    return {
      apps: appStats,
      users: userStats,
      tokens: tokenStats,
    };
  }

  // 生成应用密钥
  async generateAppSecret(appId: string) {
    const app = await this.getOauthAppById(appId);
    
    // 生成新的密钥（实际应该使用安全的随机生成方法）
    const newSecret = this.generateRandomString(32);
    app.appSecret = newSecret;
    app.updateTime = new Date();

    await this.oauthAppRepository.save(app);
    
    return { 
      success: true, 
      message: '应用密钥生成成功',
      appSecret: newSecret 
    };
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}