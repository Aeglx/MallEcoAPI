import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemMonitorService } from '../services/system-monitor.service';
import { TransformInterceptor } from '../../../shared/interceptors/transform.interceptor';

@ApiTags('系统监控')
@Controller('system/monitor')
@UseInterceptors(TransformInterceptor)
export class SystemMonitorController {
  constructor(private readonly monitorService: SystemMonitorService) {}

  @Get('health')
  @ApiOperation({ summary: '系统健康检查' })
  @ApiResponse({ status: 200, description: '健康检查成功' })
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    uptime: number;
    memory: {
      usage: number;
      total: number;
      free: number;
    };
    database: {
      status: string;
      latency: number;
    };
    redis: {
      status: string;
      latency: number;
    };
  }> {
    return await this.monitorService.healthCheck();
  }

  @Get('performance')
  @ApiOperation({ summary: '系统性能监控' })
  @ApiResponse({ status: 200, description: '性能监控数据获取成功' })
  async performanceMonitor(): Promise<{
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    memory: {
      usage: number;
      total: number;
      free: number;
      heapUsed: number;
      heapTotal: number;
    };
    network: {
      requestsPerSecond: number;
      responseTime: number;
    };
    database: {
      connections: number;
      queriesPerSecond: number;
    };
  }> {
    return await this.monitorService.performanceMonitor();
  }

  @Get('metrics')
  @ApiOperation({ summary: '系统指标数据' })
  @ApiResponse({ status: 200, description: '指标数据获取成功' })
  async getMetrics(): Promise<{
    timestamp: Date;
    metrics: Record<string, any>;
  }> {
    return await this.monitorService.getMetrics();
  }

  @Get('alerts')
  @ApiOperation({ summary: '获取告警信息' })
  @ApiResponse({ status: 200, description: '告警信息获取成功' })
  async getAlerts(): Promise<
    Array<{
      id: string;
      level: string;
      title: string;
      message: string;
      timestamp: Date;
      resolved: boolean;
    }>
  > {
    return await this.monitorService.getAlerts();
  }

  @Get('dashboard')
  @ApiOperation({ summary: '监控仪表盘数据' })
  @ApiResponse({ status: 200, description: '仪表盘数据获取成功' })
  async getDashboardData(): Promise<{
    systemStatus: {
      uptime: number;
      status: string;
      version: string;
    };
    performance: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkUsage: number;
    };
    businessMetrics: {
      activeUsers: number;
      requestsToday: number;
      ordersToday: number;
      revenueToday: number;
    };
    alerts: Array<{
      level: string;
      title: string;
      timestamp: Date;
    }>;
  }> {
    return await this.monitorService.getDashboardData();
  }
}
