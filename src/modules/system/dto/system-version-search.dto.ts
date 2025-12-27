import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SystemVersionSearchDto {
  @ApiPropertyOptional({ description: '版本号' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: '版本类型', enum: ['major', 'minor', 'patch', 'hotfix'] })
  @IsOptional()
  @IsIn(['major', 'minor', 'patch', 'hotfix'])
  type?: string;

  @ApiPropertyOptional({ description: '版本状态', enum: ['stable', 'beta', 'alpha', 'dev'] })
  @IsOptional()
  @IsIn(['stable', 'beta', 'alpha', 'dev'])
  status?: string;

  @ApiPropertyOptional({ description: '是否LTS版本' })
  @IsOptional()
  isLts?: boolean;

  @ApiPropertyOptional({ description: '是否当前版本' })
  @IsOptional()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: '是否已废弃' })
  @IsOptional()
  isDeprecated?: boolean;

  @ApiPropertyOptional({ description: '发布日期开始' })
  @IsOptional()
  @IsString()
  releaseDateStart?: string;

  @ApiPropertyOptional({ description: '发布日期结束' })
  @IsOptional()
  @IsString()
  releaseDateEnd?: string;

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
