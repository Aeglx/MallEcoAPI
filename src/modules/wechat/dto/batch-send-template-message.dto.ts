import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MiniprogramDto } from './send-template-message.dto';

export class BatchSendTemplateMessageDto {
  @ApiProperty({ description: '模板ID' })
  @IsNotEmpty({ message: '模板ID不能为空' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: '模板参数', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: '跳转链接', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: '小程序配置', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MiniprogramDto)
  miniprogram?: MiniprogramDto;
}

