import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransformInterceptor } from '../../../shared/interceptors/transform.interceptor';
import { SystemMonitorService } from '../services/system-monitor.service';
import { SystemVersionService } from '../services/system-version.service';
import { SystemConfigService } from '../services/system-config.service';

@ApiTags('系统管理')
@Controller('system/management')
@UseInterceptors(TransformInterceptor)
export class SystemManagementController {
  constructor(
    private readonly monitorService: SystemMonitorService,
    private readonly versionService: SystemVersionService,
    private readonly configService: SystemConfigService
  ) {}

  @Get('overview')
  @ApiOperation({ summary: '获取系统概览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSystemOverview() {
    // 获取系统健康状态
    const health = await this.monitorService.healthCheck();
    // 获取当前系统版本
    const currentVersion = await this.versionService.getCurrentVersion();
    // 获取系统配置摘要
    const configSummary = await this.configService.getConfigSummary();

    return {
      health,
      currentVersion,
      configSummary,
      timestamp: new Date(),
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: '获取系统管理仪表盘' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSystemDashboard() {
    // 获取系统监控仪表盘数据
    const monitorDashboard = await this.monitorService.getDashboardData();
    // 获取系统版本信息
    const versionInfo = await this.versionService.getCurrentVersion();
    // 获取系统配置摘要
    const configSummary = await this.configService.getConfigSummary();

    return {
      ...monitorDashboard,
      versionInfo,
      configSummary,
      timestamp: new Date(),
    };
  }
}
