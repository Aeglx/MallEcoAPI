import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SystemDiagnosisService } from '../services/system-diagnosis.service';
import { CreateSystemDiagnosisDto } from '../dto/create-system-diagnosis.dto';
import { SystemDiagnosisSearchDto } from '../dto/system-diagnosis-search.dto';

@ApiTags('系统诊断管理')
@Controller('system/diagnosis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemDiagnosisController {
  constructor(private readonly diagnosisService: SystemDiagnosisService) {}

  @Post()
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '创建诊断记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createDiagnosisDto: CreateSystemDiagnosisDto) {
    const diagnosis = await this.diagnosisService.create(createDiagnosisDto);
    return {
      code: HttpStatus.CREATED,
      message: '诊断记录创建成功',
      data: diagnosis,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取诊断记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() searchDto: SystemDiagnosisSearchDto) {
    const result = await this.diagnosisService.findAll(searchDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: result,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取诊断统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics() {
    const statistics = await this.diagnosisService.getStatistics();
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: statistics,
    };
  }

  @Post('full-scan')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '执行完整系统诊断' })
  @ApiResponse({ status: 200, description: '诊断完成' })
  async runFullDiagnosis() {
    const results = await this.diagnosisService.runFullDiagnosis();
    return {
      code: HttpStatus.OK,
      message: '完整系统诊断完成',
      data: results,
    };
  }

  @Post('category/:category/scan')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '执行指定类别诊断' })
  @ApiResponse({ status: 200, description: '诊断完成' })
  async runCategoryDiagnosis(@Param('category') category: string) {
    const results = await this.diagnosisService.runCategoryDiagnosis(category);
    return {
      code: HttpStatus.OK,
      message: `${category}诊断完成`,
      data: results,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取诊断记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    const diagnosis = await this.diagnosisService.findOne(+id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: diagnosis,
    };
  }

  @Patch(':id')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '更新诊断记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const diagnosis = await this.diagnosisService.update(+id, updateData);
    return {
      code: HttpStatus.OK,
      message: '更新成功',
      data: diagnosis,
    };
  }

  @Patch(':id/resolve')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '解决诊断问题' })
  @ApiResponse({ status: 200, description: '解决成功' })
  async resolveIssue(
    @Param('id') id: string,
    @Body() resolveData: { resolution: string; resolvedBy: string },
  ) {
    const diagnosis = await this.diagnosisService.resolveIssue(
      +id,
      resolveData.resolution,
      resolveData.resolvedBy,
    );
    return {
      code: HttpStatus.OK,
      message: '问题解决成功',
      data: diagnosis,
    };
  }

  @Delete(':id')
  @Roles('admin', 'system_manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除诊断记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.diagnosisService.remove(+id);
    return {
      code: HttpStatus.OK,
      message: '删除成功',
    };
  }

  @Get('health/summary')
  @ApiOperation({ summary: '获取系统健康概览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHealthSummary() {
    const statistics = await this.diagnosisService.getStatistics();
    const healthScore = this.calculateHealthScore(statistics);
    
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: {
        healthScore,
        totalIssues: statistics.unresolved,
        criticalIssues: statistics.bySeverity.find(s => s.severity === 'critical')?.count || 0,
        lastScanTime: new Date(),
        status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
      },
    };
  }

  @Get('alerts/active')
  @ApiOperation({ summary: '获取活跃告警' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getActiveAlerts() {
    const result = await this.diagnosisService.findAll({
      requiresAttention: true,
      isResolved: false,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });

    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: result.items,
    };
  }

  @Get('dashboard/metrics')
  @ApiOperation({ summary: '获取诊断仪表盘指标' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDashboardMetrics() {
    const statistics = await this.diagnosisService.getStatistics();
    const recentTrend = await this.getRecentTrend();
    
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: {
        overview: {
          total: statistics.total,
          resolved: statistics.resolved,
          unresolved: statistics.unresolved,
          resolutionRate: statistics.resolutionRate,
        },
        byType: statistics.byType,
        byCategory: statistics.byCategory,
        bySeverity: statistics.bySeverity,
        recentTrend,
        topIssues: statistics.recentIssues.slice(0, 5),
      },
    };
  }

  private calculateHealthScore(statistics: any): number {
    const { total, unresolved, bySeverity } = statistics;
    
    if (total === 0) return 100;
    
    const criticalCount = bySeverity.find(s => s.severity === 'critical')?.count || 0;
    const highCount = bySeverity.find(s => s.severity === 'high')?.count || 0;
    const mediumCount = bySeverity.find(s => s.severity === 'medium')?.count || 0;
    
    // 健康评分算法
    let score = 100;
    score -= (criticalCount * 25); // 严重问题扣25分
    score -= (highCount * 15);     // 高优先级问题扣15分
    score -= (mediumCount * 8);    // 中优先级问题扣8分
    
    return Math.max(0, Math.min(100, score));
  }

  private async getRecentTrend(): Promise<any[]> {
    // 获取最近7天的诊断趋势
    const trend = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // 这里简化处理，实际应该查询数据库
      trend.push({
        date: date.toISOString().split('T')[0],
        issues: Math.floor(Math.random() * 10),
        resolved: Math.floor(Math.random() * 8),
      });
    }
    
    return trend;
  }
}