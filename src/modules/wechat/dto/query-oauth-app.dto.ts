import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OauthAppStatus } from '../services/wechat-oauth.service';

export class QueryOauthAppDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number = 10;

  @ApiProperty({ description: '应用名称', required: false })
  @IsOptional()
  @IsString({ message: '应用名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '应用ID', required: false })
  @IsOptional()
  @IsString({ message: '应用ID必须是字符串' })
  appId?: string;

  @ApiProperty({ description: '应用状态', enum: OauthAppStatus, required: false })
  @IsOptional()
  @IsEnum(OauthAppStatus, { message: '应用状态格式不正确' })
  status?: OauthAppStatus;
}