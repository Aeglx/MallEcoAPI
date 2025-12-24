import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SystemConfigSearchDto {
  @ApiProperty({ description: '配置键名', required: false })
  @IsString()
  @IsOptional()
  configKey?: string;

  @ApiProperty({ description: '配置分组', required: false })
  @IsString()
  @IsOptional()
  configGroup?: string;

  @ApiProperty({ description: '配置描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '页码', default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}