import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseMonitorService } from './database.monitor';
import { DatabaseHealthIndicator } from '../health/database.health';
import { DatabaseBackupService } from '../../backup/database.backup';

@ApiTags('监控仪表板')
@Controller('monitoring')
export class MonitoringDashboardController {
  constructor(
    private readonly databaseMonitor: DatabaseMonitorService,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly databaseBackup: DatabaseBackupService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: '获取监控仪表板数据' })
  @ApiResponse({ status: 200, description: '监控数据获取成功' })
  async getDashboardData() {
    const [currentMetrics, healthStatus, backupHealth, performanceAnalysis] = await Promise.all([
      this.databaseMonitor.getCurrentMetrics(),
      this.getHealthStatus(),
      this.databaseBackup.checkBackupHealth(),
      this.databaseMonitor.runPerformanceAnalysis(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      database: {
        metrics: currentMetrics,
        health: healthStatus,
        backup: backupHealth,
      },
      performance: {
        analysis: performanceAnalysis,
        recommendations: this.generateRecommendations(currentMetrics, performanceAnalysis),
      },
      alerts: await this.getActiveAlerts(),
    };
  }

  @Get('metrics/history')
  @ApiOperation({ summary: '获取指标历史数据' })
  @ApiResponse({ status: 200, description: '历史数据获取成功' })
  async getMetricsHistory(@Query('hours') hours: string = '24') {
    const metricsHistory = this.databaseMonitor.getMetricsHistory(parseInt(hours));
    const healthHistory = await this.databaseHealth.getHealthHistory(parseInt(hours));

    return {
      database_metrics: Array.from(metricsHistory.entries()),
      health_checks: healthHistory,
      time_range: `${hours}小时`,
    };
  }

  @Get('performance/analysis')
  @ApiOperation({ summary: '执行性能分析' })
  @ApiResponse({ status: 200, description: '性能分析完成' })
  async runPerformanceAnalysis() {
    const analysis = await this.databaseMonitor.runPerformanceAnalysis();

    return {
      analysis,
      recommendations: this.generatePerformanceRecommendations(analysis),
    };
  }

  @Get('backup/status')
  @ApiOperation({ summary: '获取备份状态' })
  @ApiResponse({ status: 200, description: '备份状态获取成功' })
  async getBackupStatus() {
    const [health, statistics] = await Promise.all([
      this.databaseBackup.checkBackupHealth(),
      this.databaseBackup.getBackupStatistics(),
    ]);

    return {
      health,
      statistics,
      recent_backups: await this.getRecentBackups(),
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: '获取当前告警' })
  @ApiResponse({ status: 200, description: '告警列表获取成功' })
  async getActiveAlerts() {
    // 模拟获取当前告警
    return [
      {
        id: 1,
        severity: 'warning',
        message: '数据库连接数接近上限',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      },
      {
        id: 2,
        severity: 'info',
        message: '备份任务执行成功',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: true,
      },
    ];
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查端点' })
  @ApiResponse({ status: 200, description: '系统健康状态' })
  async getHealthStatus() {
    try {
      const [connection, structure, indexes, performance] = await Promise.all([
        this.databaseHealth.checkConnection(),
        this.databaseHealth.checkTableStructure(),
        this.databaseHealth.checkIndexes(),
        this.databaseHealth.checkPerformance(),
      ]);

      return {
        status: 'healthy',
        checks: {
          connection,
          structure,
          indexes,
          performance,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private generateRecommendations(metrics: any, analysis: any): string[] {
    const recommendations: string[] = [];

    if (!metrics) return ['暂无数据'];

    // 连接数建�?
    if (metrics.connectionCount > 800) {
      recommendations.push('数据库连接数过高，建议优化连接池配置或增加max_connections');
    }

    // 表大小建�?
    if (metrics.tableSize > 5368709120) {
      // 5GB
      recommendations.push('数据库表总大小超过5GB，建议考虑数据归档或分表');
    }

    // 索引使用建议
    if (metrics.indexUsage < 0.7) {
      recommendations.push('索引使用率较低，建议检查查询语句和索引设计');
    }

    // 锁等待建�?
    if (metrics.lockWaitTime > 1000) {
      recommendations.push('锁等待时间较长，建议优化事务设计或检查锁冲突');
    }

    return recommendations.length > 0 ? recommendations : ['系统运行良好，无需特殊优化'];
  }

  private generatePerformanceRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.tableSizes) {
      const largeTables = analysis.tableSizes.filter((table: any) => table.size_mb > 1000);

      if (largeTables.length > 0) {
        recommendations.push(
          `发现大表�?{largeTables.map((t: any) => t.table_name).join(', ')}，建议进行分表或归档`,
        );
      }
    }

    if (analysis.queryPerformance) {
      const slowQueries = analysis.queryPerformance.filter(
        (query: any) => query.avg_latency > 1000,
      );

      if (slowQueries.length > 0) {
        recommendations.push('发现慢查询，建议优化相关SQL语句或添加索引');
      }
    }

    return recommendations.length > 0 ? recommendations : ['查询性能良好，无需特殊优化'];
  }

  private async getRecentBackups() {
    // 模拟获取最近备份记�?
    return [
      {
        id: 1,
        type: 'full',
        file: 'malleco_full_2024-01-15T02-00-00Z.sql.gz',
        size: '2.1GB',
        status: 'success',
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'incremental',
        file: 'malleco_incremental_2024-01-15T03-00-00Z.sql',
        size: '15MB',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }
}
