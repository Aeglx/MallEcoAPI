import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

interface RedisClusterNode {
  host: string;
  port: number;
  password?: string;
}

interface RedisClusterConfig {
  nodes: RedisClusterNode[];
  options?: {
    enableReadyCheck?: boolean;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    redisOptions?: any;
  };
}

@Injectable()
export class RedisCacheAdapter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private redis: Redis | Redis.Cluster;
  private isCluster = false;
  private connectionAttempts = 0;
  private maxRetries = 3;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Redis获取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 设置缓存值
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const serializedValue = this.serialize(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Redis设置失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Redis删除失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 批量删除
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.redis.del(...keys);
      this.logger.log(`删除了 ${result} 个匹配模式 "${pattern}" 的键`);
      return result;
    } catch (error) {
      this.logger.error(`Redis批量删除失败: ${pattern}`, error);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis存在性检查失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis设置过期时间失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 获取键的剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Redis获取TTL失败: ${key}`, error);
      return -1;
    }
  }

  /**
   * 原子递增操作
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Redis递增失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 原子递减操作
   */
  async decr(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, amount);
    } catch (error) {
      this.logger.error(`Redis递减失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 列表操作 - 左推入
   */
  async lpush(key: string, value: any): Promise<number> {
    try {
      const serializedValue = this.serialize(value);
      return await this.redis.lpush(key, serializedValue);
    } catch (error) {
      this.logger.error(`Redis左推入失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 列表操作 - 右弹出
   */
  async rpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.rpop(key);
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Redis右弹出失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 哈希操作 - 设置字段
   */
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const serializedValue = this.serialize(value);
      const result = await this.redis.hset(key, field, serializedValue);
      return result >= 0;
    } catch (error) {
      this.logger.error(`Redis哈希设置失败: ${key}.${field}`, error);
      return false;
    }
  }

  /**
   * 哈希操作 - 获取字段
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Redis哈希获取失败: ${key}.${field}`, error);
      return null;
    }
  }

  /**
   * 获取Redis连接信息
   */
  async getConnectionInfo(): Promise<any> {
    try {
      const info = await this.redis.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      this.logger.error('获取Redis连接信息失败', error);
      return null;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: 'UP' | 'DOWN'; details?: any }> {
    try {
      const pong = await this.redis.ping();
      const info = await this.getConnectionInfo();
      
      return {
        status: pong === 'PONG' ? 'UP' : 'DOWN',
        details: {
          response: pong,
          connectedClients: info?.connected_clients,
          usedMemory: info?.used_memory_human,
          hitRate: this.calculateHitRate(info),
        },
      };
    } catch (error) {
      return {
        status: 'DOWN',
        details: { error: error.message },
      };
    }
  }

  /**
   * 初始化Redis连接
   */
  private async initializeRedis(): Promise<void> {
    try {
      const useCluster = this.configService.get('REDIS_CLUSTER_MODE', 'false') === 'true';
      
      if (useCluster) {
        await this.initializeCluster();
      } else {
        await this.initializeSingle();
      }
      
      this.logger.log(`Redis连接成功 (模式: ${useCluster ? '集群' : '单机'})`);
    } catch (error) {
      this.logger.error('Redis连接失败', error);
      
      if (this.connectionAttempts < this.maxRetries) {
        this.connectionAttempts++;
        this.logger.warn(`重试连接Redis (${this.connectionAttempts}/${this.maxRetries})`);
        
        // 指数退避重试
        const delay = Math.pow(2, this.connectionAttempts) * 1000;
        setTimeout(() => this.initializeRedis(), delay);
      } else {
        this.logger.error('Redis连接重试次数已用完，请检查配置');
      }
    }
  }

  /**
   * 初始化单机Redis
   */
  private async initializeSingle(): Promise<void> {
    const host = this.configService.get('REDIS_HOST', 'localhost');
    const port = parseInt(this.configService.get('REDIS_PORT', '6379'));
    const password = this.configService.get('REDIS_PASSWORD');
    const db = parseInt(this.configService.get('REDIS_DB', '0'));

    this.redis = new Redis({
      host,
      port,
      password,
      db,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // 监听连接事件
    this.redis.on('connect', () => {
      this.logger.log('Redis连接已建立');
      this.connectionAttempts = 0;
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis连接错误', error);
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis连接已关闭');
    });

    await this.redis.connect();
  }

  /**
   * 初始化Redis集群
   */
  private async initializeCluster(): Promise<void> {
    const clusterConfig: RedisClusterConfig = {
      nodes: [
        {
          host: this.configService.get('REDIS_CLUSTER_NODE_1_HOST', 'localhost'),
          port: parseInt(this.configService.get('REDIS_CLUSTER_NODE_1_PORT', '7001')),
        },
        {
          host: this.configService.get('REDIS_CLUSTER_NODE_2_HOST', 'localhost'),
          port: parseInt(this.configService.get('REDIS_CLUSTER_NODE_2_PORT', '7002')),
        },
        {
          host: this.configService.get('REDIS_CLUSTER_NODE_3_HOST', 'localhost'),
          port: parseInt(this.configService.get('REDIS_CLUSTER_NODE_3_PORT', '7003')),
        },
      ],
      options: {
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
      },
    };

    this.redis = new Redis.Cluster(clusterConfig.nodes, clusterConfig.options);
    this.isCluster = true;

    // 集群事件监听
    this.redis.on('connect', () => {
      this.logger.log('Redis集群连接已建立');
      this.connectionAttempts = 0;
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis集群连接错误', error);
    });
  }

  /**
   * 序列化数据
   */
  private serialize(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    
    try {
      return JSON.stringify(value);
    } catch (error) {
      this.logger.error('序列化数据失败', error);
      throw new Error('无法序列化缓存数据');
    }
  }

  /**
   * 反序列化数据
   */
  private deserialize<T>(value: string): T {
    try {
      // 尝试JSON解析
      return JSON.parse(value);
    } catch {
      // 如果不是JSON，直接返回字符串
      return value as unknown as T;
    }
  }

  /**
   * 解析Redis INFO输出
   */
  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key.trim()] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  /**
   * 计算命中率
   */
  private calculateHitRate(info: any): number {
    if (!info || !info.keyspace_hits || !info.keyspace_misses) {
      return 0;
    }
    
    const hits = Number(info.keyspace_hits);
    const misses = Number(info.keyspace_misses);
    const total = hits + misses;
    
    return total > 0 ? (hits / total) * 100 : 0;
  }
}