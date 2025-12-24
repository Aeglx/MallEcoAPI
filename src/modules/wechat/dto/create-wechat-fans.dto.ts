import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateWechatFansDto {
  @ApiProperty({ description: 'openid' })
  @IsNotEmpty()
  @IsString()
  openid: string;

  @ApiProperty({ description: 'unionid', required: false })
  @IsOptional()
  @IsString()
  unionid?: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '性别：0-未知，1-男，2-女', required: false })
  @IsOptional()
  @IsNumber()
  sex?: number;

  @ApiProperty({ description: '城市', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: '省份', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: '国家', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  headimgurl?: string;

  @ApiProperty({ description: '关注状态：0-未关注，1-已关注', required: false })
  @IsOptional()
  @IsNumber()
  subscribeStatus?: number;

  @ApiProperty({ description: '关注时间', required: false })
  @IsOptional()
  subscribeTime?: Date;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '标签ID列表', required: false })
  @IsOptional()
  @IsArray()
  tagIds?: number[];

  @ApiProperty({ description: '创建人ID' })
  @IsNotEmpty()
  @IsString()
  createById: string;

  @ApiProperty({ description: '更新人ID' })
  @IsNotEmpty()
  @IsString()
  updateById: string;
}