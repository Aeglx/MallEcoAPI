import { Controller, Get, Post, Delete, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemBackupService } from '../services/system-backup.service';
import { TransformInterceptor } from '../../../shared/interceptors/transform.interceptor';

@ApiTags('系统备份管理')
@Controller('system/backup')
@UseInterceptors(TransformInterceptor)
export class SystemBackupController {
  constructor(private readonly backupService: SystemBackupService) {}

  @Post('database')
  @ApiOperation({ summary: '创建数据库备份' })
  @ApiResponse({ status: 201, description: '备份创建成功' })
  async createDatabaseBackup(): Promise<{
    backupId: string;
    filename: string;
    size: number;
    createdAt: Date;
  }> {
    return await this.backupService.createDatabaseBackup();
  }

  @Post('files')
  @ApiOperation({ summary: '创建文件备份' })
  @ApiResponse({ status: 201, description: '备份创建成功' })
  async createFileBackup(): Promise<{
    backupId: string;
    filename: string;
    size: number;
    createdAt: Date;
  }> {
    return await this.backupService.createFileBackup();
  }

  @Get()
  @ApiOperation({ summary: '获取备份列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getBackupList(@Query('type') type?: string): Promise<
    Array<{
      id: string;
      type: string;
      filename: string;
      size: number;
      createdAt: Date;
      status: string;
    }>
  > {
    return await this.backupService.getBackupList(type);
  }

  @Get('status')
  @ApiOperation({ summary: '获取备份状态' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getBackupStatus(): Promise<{
    lastBackup: Date;
    backupCount: number;
    totalSize: number;
    autoBackupEnabled: boolean;
    nextBackupTime: Date;
  }> {
    return await this.backupService.getBackupStatus();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除备份' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteBackup(@Param('id') id: string): Promise<void> {
    await this.backupService.deleteBackup(id);
  }

  @Post('restore/:id')
  @ApiOperation({ summary: '恢复备份' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  async restoreBackup(@Param('id') id: string): Promise<{
    restoreId: string;
    status: string;
    estimatedTime: number;
  }> {
    return await this.backupService.restoreBackup(id);
  }

  @Get('restore/status/:id')
  @ApiOperation({ summary: '获取恢复状态' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getRestoreStatus(@Param('id') id: string): Promise<{
    status: string;
    progress: number;
    estimatedTime: number;
  }> {
    return await this.backupService.getRestoreStatus(id);
  }

  @Post('schedule')
  @ApiOperation({ summary: '设置备份计划' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setBackupSchedule(@Query('schedule') schedule: string): Promise<{
    schedule: string;
    nextBackupTime: Date;
  }> {
    return await this.backupService.setBackupSchedule(schedule);
  }

  @Get('storage')
  @ApiOperation({ summary: '获取存储空间信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getStorageInfo(): Promise<{
    totalSpace: number;
    usedSpace: number;
    freeSpace: number;
    backupSpace: number;
  }> {
    return await this.backupService.getStorageInfo();
  }
}
