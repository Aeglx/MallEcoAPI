import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MiniprogramDto {
  @ApiProperty({ description: '小程序AppID' })
  @IsNotEmpty({ message: '小程序AppID不能为空' })
  @IsString()
  appid: string;

  @ApiProperty({ description: '小程序页面路径' })
  @IsNotEmpty({ message: '小程序页面路径不能为空' })
  @IsString()
  pagepath: string;
}

export class SendTemplateMessageDto {
  @ApiProperty({ description: '模板ID' })
  @IsNotEmpty({ message: '模板ID不能为空' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: '用户OpenID' })
  @IsNotEmpty({ message: '用户OpenID不能为空' })
  @IsString()
  openid: string;

  @ApiProperty({ description: '模板参数', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: '跳转链接', required: false })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'URL格式不正确' })
  url?: string;

  @ApiProperty({ description: '小程序配置', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MiniprogramDto)
  miniprogram?: MiniprogramDto;
}

