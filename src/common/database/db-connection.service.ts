import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbConnectionService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // 创建数据库连接池
    this.pool = mysql.createPool({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      charset: this.configService.get<string>('DB_CHARSET') || 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true, // 启用命名占位符
    });

    // 测试连接
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('数据库连接池初始化成功');
    } catch (error) {
      console.warn('数据库连接池初始化失败，但应用程序将继续运行:', error);
      // 不抛出错误，让应用程序继续运行
    }
  }

  async onModuleDestroy() {
    // 关闭连接池
    if (this.pool) {
      await this.pool.end();
      console.log('数据库连接池已关闭');
    }
  }

  /**
   * 获取连接
   */
  async getConnection(): Promise<mysql.PoolConnection> {
    return this.pool.getConnection();
  }

  /**
   * 执行查询
   */
  async query<T = any>(sql: string, params?: any): Promise<T[]> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T[];
  }

  /**
   * 执行单个查询（返回第一条结果）
   */
  async queryOne<T = any>(sql: string, params?: any): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 执行事务
   */
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
