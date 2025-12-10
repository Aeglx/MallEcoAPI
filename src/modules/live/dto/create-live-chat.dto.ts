import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLiveChatDto {
  @ApiProperty({ description: '直播间ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ description: '消息内容' })
  @IsString()
  message: string;

  @ApiProperty({ description: '消息类型', default: 1 })
  @IsOptional()
  @IsNumber()
  messageType?: number = 1;

  @ApiProperty({ description: '回复的消息ID', required: false })
  @IsOptional()
  @IsString()
  replyToId?: string;

  @ApiProperty({ description: '额外信息', required: false })
  @IsOptional()
  extra?: Record<string, any>;
}