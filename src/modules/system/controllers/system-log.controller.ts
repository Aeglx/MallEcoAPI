import { Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SystemLogService } from '../services/system-log.service';
import { SystemLogEntity } from '../entities/system-log.entity';
import { SystemLogSearchDto } from '../dto/system-log-search.dto';
import { TransformInterceptor } from '../../../shared/interceptors/transform.interceptor';

@ApiTags('系统日志管理')
@Controller('system/log')
@UseInterceptors(TransformInterceptor)
export class SystemLogController {
  constructor(private readonly logService: SystemLogService) {}

  @Post()
  @ApiOperation({ summary: '记录系统日志' })
  @ApiResponse({ status: 201, description: '日志记录成功', type: SystemLogEntity })
  @ApiResponse({ status: 400, description: '参数错误' })
  async create(@Body() logData: Partial<SystemLogEntity>): Promise<SystemLogEntity> {
    return await this.logService.log(logData);
  }

  @Get()
  @ApiOperation({ summary: '查询系统日志列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() searchDto: SystemLogSearchDto): Promise<{
    list: SystemLogEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.logService.findAll(searchDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取日志统计信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getStatistics(@Query('days') days: number = 7): Promise<{
    totalCount: number;
    errorCount: number;
    warningCount: number;
    dailyStats: Array<{ date: string; count: number; errorCount: number }>;
    levelStats: Array<{ level: string; count: number }>;
    moduleStats: Array<{ module: string; count: number }>;
  }> {
    return await this.logService.getLogStatistics(days);
  }

  @Get('types')
  @ApiOperation({ summary: '获取日志类型列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getLogTypes(): Promise<string[]> {
    return await this.logService.getLogTypes();
  }

  @Get('modules')
  @ApiOperation({ summary: '获取模块列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getModules(): Promise<string[]> {
    return await this.logService.getModules();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询日志' })
  @ApiResponse({ status: 200, description: '查询成功', type: SystemLogEntity })
  async findOne(@Param('id') id: string): Promise<SystemLogEntity> {
    return await this.logService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除日志' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.logService.remove(+id);
  }

  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除日志' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeBatch(@Body('ids') ids: number[]): Promise<void> {
    await this.logService.removeBatch(ids);
  }

  @Post('clean-expired')
  @ApiOperation({ summary: '清理过期日志' })
  @ApiBody({ schema: { type: 'object', properties: { keepDays: { type: 'number', default: 30 } } } })
  @ApiResponse({ status: 200, description: '清理成功' })
  async cleanExpiredLogs(@Body('keepDays') keepDays: number = 30): Promise<{ deletedCount: number }> {
    const deletedCount = await this.logService.cleanExpiredLogs(keepDays);
    return { deletedCount };
  }
}