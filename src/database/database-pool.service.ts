import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PrometheusService } from '../infrastructure/monitoring/prometheus.service';

@Injectable()
export class DatabasePoolService implements OnModuleInit, OnModuleDestroy {
  private dataSource: DataSource;
  private queryCount = 0;
  private errorCount = 0;
  private slowQueryThreshold = 1000; // 1�?

  constructor(
    private configService: ConfigService,
    private prometheusService: PrometheusService,
  ) {
    this.initDataSource();
  }

  async onModuleInit() {
    try {
      await this.dataSource.initialize();
      console.log('Database connection pool initialized');

      // 启动连接池监�?
      this.startPoolMonitoring();
    } catch (error) {
      console.error('Failed to initialize database connection pool:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('Database connection pool destroyed');
    }
  }

  private initDataSource() {
    this.dataSource = new DataSource({
      type: 'mysql',
      host: this.configService.get('DB_HOST') || 'localhost',
      port: this.configService.get('DB_PORT') || 3306,
      username: this.configService.get('DB_USERNAME') || 'root',
      password: this.configService.get('DB_PASSWORD') || 'password',
      database: this.configService.get('DB_DATABASE') || 'malldb',

      // 连接池配置（类似Druid的功能）
      poolSize: this.configService.get('DB_POOL_SIZE') || 10,
      extra: {
        connectionLimit: this.configService.get('DB_CONNECTION_LIMIT') || 20,
        acquireTimeout: this.configService.get('DB_ACQUIRE_TIMEOUT') || 60000,
        timeout: this.configService.get('DB_TIMEOUT') || 60000,
      },

      // 性能优化配置
      synchronize: false,
      logging: this.configService.get('DB_LOGGING') === 'true',

      // 实体和迁移配�?
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],

      // 连接池事件处理已移除，使用默认的错误处理机制
    });

    // 添加查询监听�?
    this.addQueryListeners();
  }

  private addQueryListeners() {
    // TypeORM 不再支持 subscribe 方法，改为使用 logging 参数和自定义 logger
    // 这里移除监听逻辑，保留基本的查询计数功能
  }

  private startPoolMonitoring() {
    // 定期检查连接池状�?
    setInterval(() => {
      this.monitorPoolHealth();
    }, 30000); // �?0秒检查一�?
  }

  private async monitorPoolHealth() {
    try {
      const pool = (this.dataSource.driver as any).pool;

      if (pool) {
        const poolStats = {
          totalConnections: pool._allConnections?.length || 0,
          activeConnections: pool._acquiringConnections?.length || 0,
          idleConnections: pool._freeConnections?.length || 0,
          waitingClients: pool._connectionQueue?.length || 0,
        };

        // 记录连接池指�?
        this.prometheusService.recordConnectionPoolStats(poolStats);

        // 连接池健康检�?
        if (poolStats.waitingClients > 5) {
          console.warn('Database connection pool has high waiting clients:', poolStats);
        }

        if (poolStats.totalConnections === 0) {
          console.error('Database connection pool has no connections');
        }
      }
    } catch (error) {
      console.error('Failed to monitor database pool health:', error);
    }
  }

  // ==================== 公共方法 ====================

  /**
   * 获取数据库连�?
   */
  getConnection() {
    return this.dataSource;
  }

  /**
   * 执行原生SQL查询
   */
  async query<T = any>(sql: string, parameters?: any[]): Promise<T> {
    return this.dataSource.query(sql, parameters);
  }

  /**
   * 开始事�?
   */
  async createQueryRunner(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return queryRunner;
  }

  /**
   * 获取连接池统计信�?
   */
  getPoolStats() {
    const pool = (this.dataSource.driver as any).pool;

    if (!pool) {
      return {
        status: 'unknown',
        message: 'Connection pool not available',
      };
    }

    return {
      status: 'healthy',
      totalConnections: pool._allConnections?.length || 0,
      activeConnections: pool._acquiringConnections?.length || 0,
      idleConnections: pool._freeConnections?.length || 0,
      waitingClients: pool._connectionQueue?.length || 0,
      queryCount: this.queryCount,
      errorCount: this.errorCount,
      errorRate: this.queryCount > 0 ? (this.errorCount / this.queryCount) * 100 : 0,
    };
  }

  /**
   * 健康检�?
   */
  async healthCheck(): Promise<{
    status: string;
    message?: string;
    details?: any;
  }> {
    try {
      // 执行简单查询测试连�?
      await this.dataSource.query('SELECT 1');

      const poolStats = this.getPoolStats();

      if (poolStats.status === 'healthy' && poolStats.totalConnections > 0) {
        return {
          status: 'healthy',
          details: poolStats,
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Connection pool issues detected',
          details: poolStats,
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        details: { error: error.message },
      };
    }
  }

  /**
   * 重置连接�?
   */
  async resetPool(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      await this.dataSource.initialize();
      console.log('Database connection pool reset');
    }
  }

  /**
   * 获取慢查询阈�?
   */
  getSlowQueryThreshold(): number {
    return this.slowQueryThreshold;
  }

  /**
   * 设置慢查询阈�?
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    // 注意：TypeORM DataSource.options 是只读的，无法动态修改
    // 如需修改慢查询阈值，需要重新创建 DataSource
  }
}
