import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateSystemConfigDto {
  @ApiProperty({ description: '配置键名' })
  @IsString()
  @IsNotEmpty()
  configKey: string;

  @ApiProperty({ description: '配置值' })
  @IsString()
  @IsNotEmpty()
  configValue: string;

  @ApiProperty({ description: '配置描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '配置类型', default: 'string' })
  @IsString()
  @IsOptional()
  configType?: string;

  @ApiProperty({ description: '是否可修改', default: true })
  @IsBoolean()
  @IsOptional()
  editable?: boolean;

  @ApiProperty({ description: '配置分组', default: 'default' })
  @IsString()
  @IsOptional()
  configGroup?: string;

  @ApiProperty({ description: '排序值', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: '创建人', required: false })
  @IsString()
  @IsOptional()
  createdBy?: string;
}