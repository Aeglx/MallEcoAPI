import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Logger } from '@nestjs/common';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator implements OnModuleInit {
  private readonly logger = new Logger(DatabaseHealthIndicator.name);

  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }

  async onModuleInit() {
    await this.initializeHealthChecks();
  }

  /**
   * 初始化健康检查
   */
  private async initializeHealthChecks() {
    try {
      // 创建健康检查表
      await this.createHealthCheckTable();
      this.logger.log('Database health check system initialized');
    } catch (error) {
      this.logger.error('Failed to initialize health check system', error);
    }
  }

  /**
   * 创建健康检查表
   */
  private async createHealthCheckTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS mall_health_checks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        check_name VARCHAR(100) NOT NULL,
        status ENUM('healthy', 'unhealthy') NOT NULL,
        response_time_ms INT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_check_name (check_name),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await this.connection.query(query);
  }

  /**
   * 检查数据库连接
   */
  async checkConnection(): Promise<HealthIndicatorResult> {
    const key = 'database_connection';

    try {
      const startTime = Date.now();
      await this.connection.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      // 记录健康检查结果
      await this.recordHealthCheck(key, 'healthy', responseTime);

      return this.getStatus(key, true, {
        responseTime: `${responseTime}ms`,
        database: this.connection.options.database,
        driver: this.connection.driver.options.type,
      });
    } catch (error) {
      await this.recordHealthCheck(key, 'unhealthy', null, error.message);

      throw new HealthCheckError(
        'Database connection failed',
        this.getStatus(key, false, {
          error: error.message,
        }),
      );
    }
  }

  /**
   * 检查表结构完整性
   */
  async checkTableStructure(): Promise<HealthIndicatorResult> {
    const key = 'table_structure';

    try {
      const requiredTables = [
        'mall_users',
        'mall_roles',
        'mall_permissions',
        'mall_products',
        'mall_orders',
        'mall_categories',
      ];

      const missingTables = [];
      const startTime = Date.now();

      for (const table of requiredTables) {
        const result = await this.connection.query(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = ? AND table_name = ?`,
          [this.connection.options.database, table],
        );

        if (parseInt(result[0].count) === 0) {
          missingTables.push(table);
        }
      }

      const responseTime = Date.now() - startTime;

      if (missingTables.length > 0) {
        await this.recordHealthCheck(
          key,
          'unhealthy',
          responseTime,
          `Missing tables: ${missingTables.join(', ')}`,
        );

        throw new HealthCheckError(
          'Missing required tables',
          this.getStatus(key, false, {
            missingTables,
            responseTime: `${responseTime}ms`,
          }),
        );
      }

      await this.recordHealthCheck(key, 'healthy', responseTime);

      return this.getStatus(key, true, {
        requiredTables: requiredTables.length,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      await this.recordHealthCheck(key, 'unhealthy', null, error.message);
      throw error;
    }
  }

  /**
   * 检查索引状态
   */
  async checkIndexes(): Promise<HealthIndicatorResult> {
    const key = 'database_indexes';

    try {
      const startTime = Date.now();

      // 检查关键表的索引状态
      const criticalTables = ['mall_orders', 'mall_users', 'mall_products'];
      const indexIssues = [];

      for (const table of criticalTables) {
        const indexes = await this.connection.query(
          `
          SELECT 
            INDEX_NAME,
            COUNT(*) as column_count,
            SEQ_IN_INDEX
          FROM information_schema.statistics 
          WHERE table_schema = ? AND table_name = ?
          GROUP BY INDEX_NAME
          ORDER BY INDEX_NAME, SEQ_IN_INDEX
        `,
          [this.connection.options.database, table],
        );

        if (indexes.length === 0) {
          indexIssues.push(`${table}: No indexes found`);
        }
      }

      const responseTime = Date.now() - startTime;

      if (indexIssues.length > 0) {
        await this.recordHealthCheck(
          key,
          'unhealthy',
          responseTime,
          `Index issues: ${indexIssues.join('; ')}`,
        );

        throw new HealthCheckError(
          'Index issues detected',
          this.getStatus(key, false, {
            issues: indexIssues,
            responseTime: `${responseTime}ms`,
          }),
        );
      }

      await this.recordHealthCheck(key, 'healthy', responseTime);

      return this.getStatus(key, true, {
        tablesChecked: criticalTables.length,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      await this.recordHealthCheck(key, 'unhealthy', null, error.message);
      throw error;
    }
  }

  /**
   * 检查数据库性能
   */
  async checkPerformance(): Promise<HealthIndicatorResult> {
    const key = 'database_performance';

    try {
      const startTime = Date.now();

      // 执行简单的性能测试查询
      const queries = [
        'SELECT COUNT(*) as count FROM mall_users',
        'SELECT COUNT(*) as count FROM mall_orders WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)',
        'EXPLAIN SELECT * FROM mall_products WHERE status = 1 LIMIT 10',
      ];

      const performanceMetrics = [];

      for (const query of queries) {
        const queryStart = Date.now();
        await this.connection.query(query);
        const queryTime = Date.now() - queryStart;
        performanceMetrics.push({
          query: query.split(' ')[1], // 获取查询类型
          executionTime: queryTime,
        });
      }

      const responseTime = Date.now() - startTime;

      // 检查是否有查询性能问题
      const slowQueries = performanceMetrics.filter(metric => metric.executionTime > 1000);

      if (slowQueries.length > 0) {
        await this.recordHealthCheck(
          key,
          'unhealthy',
          responseTime,
          `Slow queries detected: ${JSON.stringify(slowQueries)}`,
        );

        throw new HealthCheckError(
          'Performance issues detected',
          this.getStatus(key, false, {
            slowQueries,
            responseTime: `${responseTime}ms`,
          }),
        );
      }

      await this.recordHealthCheck(key, 'healthy', responseTime);

      return this.getStatus(key, true, {
        queriesExecuted: queries.length,
        averageTime: `${(performanceMetrics.reduce((sum, m) => sum + m.executionTime, 0) / performanceMetrics.length).toFixed(2)}ms`,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      await this.recordHealthCheck(key, 'unhealthy', null, error.message);
      throw error;
    }
  }

  /**
   * 记录健康检查结果
   */
  private async recordHealthCheck(
    checkName: string,
    status: 'healthy' | 'unhealthy',
    responseTime?: number,
    errorMessage?: string,
  ) {
    try {
      await this.connection.query(
        `INSERT INTO mall_health_checks (check_name, status, response_time_ms, error_message) 
         VALUES (?, ?, ?, ?)`,
        [checkName, status, responseTime, errorMessage],
      );
    } catch (error) {
      this.logger.error(`Failed to record health check: ${error.message}`);
    }
  }

  /**
   * 获取健康检查历史
   */
  async getHealthHistory(hours: number = 24) {
    try {
      const results = await this.connection.query(
        `SELECT check_name, status, response_time_ms, error_message, created_at 
         FROM mall_health_checks 
         WHERE created_at > DATE_SUB(NOW(), INTERVAL ? HOUR) 
         ORDER BY created_at DESC`,
        [hours],
      );

      return results;
    } catch (error) {
      this.logger.error(`Failed to get health history: ${error.message}`);
      return [];
    }
  }

  /**
   * 清理旧的健康检查记录
   */
  async cleanupHealthRecords(daysToKeep: number = 30) {
    try {
      await this.connection.query(
        'DELETE FROM mall_health_checks WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysToKeep],
      );

      this.logger.log(`Cleaned up health records older than ${daysToKeep} days`);
    } catch (error) {
      this.logger.error(`Failed to cleanup health records: ${error.message}`);
    }
  }
}
