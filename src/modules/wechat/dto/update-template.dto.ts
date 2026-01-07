import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateTemplateDto {
  @ApiProperty({ description: '模板标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '模板内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '模板示例', required: false })
  @IsOptional()
  @IsString()
  example?: string;

  @ApiProperty({ description: '分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '模板类型：1-营销，2-通知', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2], { message: '模板类型只能是1或2' })
  type?: number;

  @ApiProperty({ description: '状态：1-启用，0-禁用', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '跳转URL', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: '小程序AppID', required: false })
  @IsOptional()
  @IsString()
  miniprogramAppid?: string;

  @ApiProperty({ description: '小程序路径', required: false })
  @IsOptional()
  @IsString()
  miniprogramPath?: string;
}

