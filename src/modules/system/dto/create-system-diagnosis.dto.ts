import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemDiagnosisDto {
  @ApiProperty({ description: '诊断类型' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['health', 'performance', 'security', 'dependency', 'connectivity'])
  type: string;

  @ApiProperty({ description: '诊断类别' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['database', 'cache', 'network', 'disk', 'memory', 'cpu', 'api'])
  category: string;

  @ApiProperty({ description: '状态' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['normal', 'warning', 'error', 'critical'])
  status: string;

  @ApiProperty({ description: '标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: '详细信息', required: false })
  @IsOptional()
  details?: any;

  @ApiProperty({ description: '指标数据', required: false })
  @IsOptional()
  metrics?: any;

  @ApiProperty({ description: '建议处理方案', required: false })
  @IsOptional()
  @IsString()
  suggestion?: string;

  @ApiProperty({ description: '推荐操作', required: false })
  @IsOptional()
  @IsArray()
  actions?: any[];

  @ApiProperty({ description: '影响范围', required: false })
  @IsOptional()
  affected?: any;

  @ApiProperty({ description: '严重程度', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @ApiProperty({ description: '是否为自动诊断', required: false })
  @IsOptional()
  @IsBoolean()
  isAutoDiagnosis?: boolean;

  @ApiProperty({ description: '诊断阈值', required: false })
  @IsOptional()
  thresholds?: any;

  @ApiProperty({ description: '诊断上下文信息', required: false })
  @IsOptional()
  context?: any;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: '下次检查时间', required: false })
  @IsOptional()
  nextCheck?: Date;
}