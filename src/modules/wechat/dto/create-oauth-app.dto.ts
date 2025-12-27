import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OauthAppStatus } from '../services/wechat-oauth.service';

export class CreateOauthAppDto {
  @ApiProperty({ description: '应用名称' })
  @IsNotEmpty({ message: '应用名称不能为空' })
  @IsString({ message: '应用名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '应用ID' })
  @IsNotEmpty({ message: '应用ID不能为空' })
  @IsString({ message: '应用ID必须是字符串' })
  appId: string;

  @ApiProperty({ description: '应用密钥' })
  @IsNotEmpty({ message: '应用密钥不能为空' })
  @IsString({ message: '应用密钥必须是字符串' })
  appSecret: string;

  @ApiProperty({ description: '应用描述', required: false })
  @IsOptional()
  @IsString({ message: '应用描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '回调URL' })
  @IsNotEmpty({ message: '回调URL不能为空' })
  @IsUrl({}, { message: '回调URL格式不正确' })
  redirectUri: string;

  @ApiProperty({ description: '应用状态', enum: OauthAppStatus, default: OauthAppStatus.DRAFT })
  @IsOptional()
  @IsEnum(OauthAppStatus, { message: '应用状态格式不正确' })
  status?: OauthAppStatus;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: '应用图标', required: false })
  @IsOptional()
  @IsString({ message: '应用图标必须是字符串' })
  icon?: string;

  @ApiProperty({ description: '授权范围', required: false })
  @IsOptional()
  @IsString({ message: '授权范围必须是字符串' })
  scope?: string;

  @ApiProperty({ description: '授权类型', required: false })
  @IsOptional()
  @IsString({ message: '授权类型必须是字符串' })
  grantType?: string;
}
