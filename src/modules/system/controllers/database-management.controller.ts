import { Controller, Get, Post, Delete, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransformInterceptor } from '../../../shared/interceptors/transform.interceptor';
import { SystemBackupService } from '../services/system-backup.service';
import { SystemMonitorService } from '../services/system-monitor.service';

@ApiTags('数据库管理')
@Controller('system/database')
@UseInterceptors(TransformInterceptor)
export class DatabaseManagementController {
  constructor(
    private readonly backupService: SystemBackupService,
    private readonly monitorService: SystemMonitorService
  ) {}

  @Get('status')
  @ApiOperation({ summary: '获取数据库状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDatabaseStatus() {
    const healthCheck = await this.monitorService.healthCheck();
    return {
      status: healthCheck.database.status,
      latency: healthCheck.database.latency
    };
  }

  @Post('backup')
  @ApiOperation({ summary: '创建数据库备份' })
  @ApiResponse({ status: 201, description: '备份创建成功' })
  async createBackup() {
    return await this.backupService.createDatabaseBackup();
  }

  @Get('backups')
  @ApiOperation({ summary: '获取数据库备份列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getBackups(@Query() query: { page?: number; limit?: number }) {
    return await this.backupService.getBackupList('database');
  }

  @Delete('backup/:id')
  @ApiOperation({ summary: '删除数据库备份' })
  @ApiResponse({ status: 200, description: '备份删除成功' })
  async deleteBackup(@Param('id') id: string) {
    return await this.backupService.deleteBackup(id);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取数据库统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDatabaseStats() {
    const performance = await this.monitorService.performanceMonitor();
    return {
      connections: performance.database.connections,
      queriesPerSecond: performance.database.queriesPerSecond
    };
  }
}