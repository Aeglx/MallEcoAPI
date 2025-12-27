import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TokenStatus } from '../services/wechat-oauth.service';

export class QueryOauthTokenDto {
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

  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '用户ID必须是数字' })
  userId?: number;

  @ApiProperty({ description: '应用ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '应用ID必须是数字' })
  appId?: number;

  @ApiProperty({ description: '令牌状态', enum: TokenStatus, required: false })
  @IsOptional()
  @IsEnum(TokenStatus, { message: '令牌状态格式不正确' })
  status?: TokenStatus;
}
