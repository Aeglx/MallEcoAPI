import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CacheType {
  REDIS = 'redis',
  MEMORY = 'memory',
  MONGO = 'mongo'
}

export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo'
}

export class CreateCacheConfigDto {
  @ApiProperty({ description: '缓存名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '缓存类型', enum: CacheType })
  @IsEnum(CacheType)
  type: CacheType;

  @ApiProperty({ description: '缓存策略', enum: CacheStrategy })
  @IsEnum(CacheStrategy)
  strategy: CacheStrategy;

  @ApiProperty({ description: '缓存大小(MB)' })
  @IsNumber()
  @Min(1)
  @Max(10240)
  size: number;

  @ApiProperty({ description: '过期时间(秒)' })
  @IsNumber()
  @Min(60)
  ttl: number;

  @ApiProperty({ description: '最大键数量' })
  @IsNumber()
  @Min(100)
  maxKeys: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCacheConfigDto {
  @ApiProperty({ description: '缓存类型', enum: CacheType, required: false })
  @IsOptional()
  @IsEnum(CacheType)
  type?: CacheType;

  @ApiProperty({ description: '缓存策略', enum: CacheStrategy, required: false })
  @IsOptional()
  @IsEnum(CacheStrategy)
  strategy?: CacheStrategy;

  @ApiProperty({ description: '缓存大小(MB)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10240)
  size?: number;

  @ApiProperty({ description: '过期时间(秒)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(60)
  ttl?: number;

  @ApiProperty({ description: '最大键数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  maxKeys?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CacheConfigSearchDto {
  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页条数', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: '缓存名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '缓存类型', required: false })
  @IsOptional()
  @IsEnum(CacheType)
  type?: CacheType;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean;
}