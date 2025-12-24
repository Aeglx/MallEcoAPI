import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import Redis from 'ioredis';

interface ConnectionStats {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  waitingClients: number;
}

@Injectable()
export class ConnectionPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConnectionPoolService.name);
  private mysqlPool: Pool;
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializePools();
  }

  async onModuleDestroy() {
    await this.destroyPools();
  }

  /**
   * 初始化连接池
   */
  private async initializePools() {
    try {
      // 初始化MySQL连接池
      this.mysqlPool = createPool({
        host: this.configService.get('DB_HOST'),
        port: this.configService.get('DB_PORT'),
        user: this.configService.get('DB_USERNAME'),
        password: this.configService.get('DB_PASSWORD'),
        database: this.configService.get('DB_NAME'),
        charset: this.configService.get('DB_CHARSET'),
        
        // 连接池配置
        connectionLimit: this.configService.get('database.connectionLimit') || 20,
        
        // 性能优化配置
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        queueLimit: 1000,
      });

      // 初始化Redis连接池
      this.redisClient = new Redis({
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        password: this.configService.get('REDIS_PASSWORD'),
        db: this.configService.get('REDIS_DB'),
        
        // 连接池配置
        maxRetriesPerRequest: this.configService.get('redis.maxRetriesPerRequest') || 3,
        enableReadyCheck: true,
        
        // 性能优化配置
        lazyConnect: true,
        enableOfflineQueue: true,
        connectTimeout: this.configService.get('redis.connectionTimeout') || 10000,
        commandTimeout: 5000,
      });

      this.logger.log('Connection pools initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize connection pools:', error);
      throw error;
    }
  }

  /**
   * 获取MySQL连接
   */
  async getMysqlConnection() {
    try {
      const connection = await this.mysqlPool.getConnection();
      
      // 设置连接超时
      connection.on('error', (err) => {
        this.logger.error('MySQL connection error:', err);
      });

      return connection;
    } catch (error) {
      this.logger.error('Failed to get MySQL connection:', error);
      throw error;
    }
  }

  /**
   * 执行MySQL查询
   */
  async executeQuery(sql: string, params: any[] = []) {
    try {
      const [rows] = await this.mysqlPool.execute(sql, params);
      return rows;
    } catch (error) {
      this.logger.error('MySQL query error:', { sql, params, error });
      throw error;
    }
  }

  /**
   * 获取Redis客户端
   */
  getRedisClient(): Redis {
    return this.redisClient;
  }

  /**
   * 获取连接池统计信息
   */
  async getPoolStats(): Promise<{
    mysql: ConnectionStats;
    redis: {
      status: string;
      connected: boolean;
      memory: string;
    };
  }> {
    try {
      // MySQL连接池统计
      const mysqlStats = await this.getMysqlPoolStats();
      
      // Redis连接统计
      const redisStats = await this.getRedisStats();
      
      return {
        mysql: mysqlStats,
        redis: redisStats,
      };
    } catch (error) {
      this.logger.error('Failed to get pool stats:', error);
      throw error;
    }
  }

  /**
   * 获取MySQL连接池统计信息
   */
  private async getMysqlPoolStats(): Promise<ConnectionStats> {
    try {
      // 获取连接池状态
      const pool = this.mysqlPool as any;
      
      return {
        activeConnections: pool._allConnections.length - pool._freeConnections.length,
        idleConnections: pool._freeConnections.length,
        totalConnections: pool._allConnections.length,
        waitingClients: pool._connectionQueue.length,
      };
    } catch (error) {
      this.logger.error('Failed to get MySQL pool stats:', error);
      return {
        activeConnections: 0,
        idleConnections: 0,
        totalConnections: 0,
        waitingClients: 0,
      };
    }
  }

  /**
   * 获取Redis统计信息
   */
  private async getRedisStats(): Promise<{
    status: string;
    connected: boolean;
    memory: string;
  }> {
    try {
      const info = await this.redisClient.info('memory');
      const status = await this.redisClient.status;
      const connected = this.redisClient.status === 'ready';
      
      // 解析内存使用情况
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'unknown';
      
      return {
        status,
        connected,
        memory,
      };
    } catch (error) {
      this.logger.error('Failed to get Redis stats:', error);
      return {
        status: 'error',
        connected: false,
        memory: 'unknown',
      };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    mysql: boolean;
    redis: boolean;
    overall: boolean;
  }> {
    try {
      // 检查MySQL连接
      const mysqlHealthy = await this.checkMysqlHealth();
      
      // 检查Redis连接
      const redisHealthy = await this.checkRedisHealth();
      
      return {
        mysql: mysqlHealthy,
        redis: redisHealthy,
        overall: mysqlHealthy && redisHealthy,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        mysql: false,
        redis: false,
        overall: false,
      };
    }
  }

  private async checkMysqlHealth(): Promise<boolean> {
    try {
      const connection = await this.getMysqlConnection();
      const [rows] = await connection.execute('SELECT 1');
      connection.release();
      return true;
    } catch (error) {
      this.logger.error('MySQL health check failed:', error);
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * 优化连接池配置
   */
  async optimizePools(): Promise<void> {
    try {
      // 获取当前负载情况
      const stats = await this.getPoolStats();
      
      // 根据负载情况动态调整连接池配置
      if (stats.mysql.waitingClients > 10) {
        this.logger.warn('MySQL connection pool under high load, consider increasing connection limit');
      }
      
      if (stats.mysql.idleConnections > stats.mysql.activeConnections * 2) {
        this.logger.warn('MySQL connection pool has too many idle connections, consider reducing connection limit');
      }
      
      this.logger.log('Connection pool optimization completed');
    } catch (error) {
      this.logger.error('Failed to optimize pools:', error);
    }
  }

  /**
   * 销毁连接池
   */
  private async destroyPools() {
    try {
      if (this.mysqlPool) {
        await this.mysqlPool.end();
        this.logger.log('MySQL connection pool closed');
      }
      
      if (this.redisClient) {
        await this.redisClient.quit();
        this.logger.log('Redis connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing connection pools:', error);
    }
  }
}