import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum OauthUserStatus {
  ACTIVE = 0, // 活跃
  INACTIVE = 1, // 不活跃
  BLOCKED = 2, // 已封禁
}

export class QueryOauthUserDto {
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

  @ApiProperty({ description: '用户昵称', required: false })
  @IsOptional()
  @IsString({ message: '用户昵称必须是字符串' })
  nickname?: string;

  @ApiProperty({ description: '应用ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '应用ID必须是数字' })
  appId?: number;

  @ApiProperty({ description: '用户状态', enum: OauthUserStatus, required: false })
  @IsOptional()
  @IsEnum(OauthUserStatus, { message: '用户状态格式不正确' })
  status?: OauthUserStatus;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;
}