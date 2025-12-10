import { IsOptional, IsString, IsIn, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SystemDiagnosisSearchDto {
  @ApiPropertyOptional({ description: '诊断类型', enum: ['health', 'performance', 'security', 'dependency', 'connectivity'] })
  @IsOptional()
  @IsIn(['health', 'performance', 'security', 'dependency', 'connectivity'])
  type?: string;

  @ApiPropertyOptional({ description: '诊断类别', enum: ['database', 'cache', 'network', 'disk', 'memory', 'cpu', 'api'] })
  @IsOptional()
  @IsIn(['database', 'cache', 'network', 'disk', 'memory', 'cpu', 'api'])
  category?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['normal', 'warning', 'error', 'critical'] })
  @IsOptional()
  @IsIn(['normal', 'warning', 'error', 'critical'])
  status?: string;

  @ApiPropertyOptional({ description: '严重程度', enum: ['low', 'medium', 'high', 'critical'] })
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @ApiPropertyOptional({ description: '是否已解决' })
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @ApiPropertyOptional({ description: '是否需要关注' })
  @IsOptional()
  @IsBoolean()
  requiresAttention?: boolean;

  @ApiPropertyOptional({ description: '是否为自动诊断' })
  @IsOptional()
  @IsBoolean()
  isAutoDiagnosis?: boolean;

  @ApiPropertyOptional({ description: '标题关键词' })
  @IsOptional()
  @IsString()
  titleKeyword?: string;

  @ApiPropertyOptional({ description: '创建时间开始' })
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional({ description: '创建时间结束' })
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;

  @ApiPropertyOptional({ description: '解决时间开始' })
  @IsOptional()
  @IsDateString()
  resolvedAtStart?: string;

  @ApiPropertyOptional({ description: '解决时间结束' })
  @IsOptional()
  @IsDateString()
  resolvedAtEnd?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: '解决人' })
  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @ApiPropertyOptional({ description: '页码', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}