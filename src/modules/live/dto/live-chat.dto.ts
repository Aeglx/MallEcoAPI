import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SendLiveChatDto {
  @ApiProperty({ description: '直播间ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ description: '消息内容' })
  @IsString()
  message: string;

  @ApiProperty({ description: '回复的消息ID', required: false })
  @IsOptional()
  @IsString()
  replyToId?: string;

  @ApiProperty({ description: '额外信息', required: false })
  @IsOptional()
  extra?: Record<string, any>;
}

export class LiveChatSearchParams {
  @ApiProperty({ description: '直播间ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ description: '消息类型', required: false })
  @IsOptional()
  @IsNumber()
  messageType?: number;

  @ApiProperty({ description: '用户角色', required: false })
  @IsOptional()
  userRole?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  endTime?: string;

  @ApiProperty({ description: '当前页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 50 })
  @IsOptional()
  @Type(() => Number)
  size?: number = 50;

  @ApiProperty({ description: '排序字段', default: 'createTime' })
  @IsOptional()
  sortBy?: string = 'createTime';

  @ApiProperty({ description: '排序方向', default: 'ASC' })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class LiveGiftDto {
  @ApiProperty({ description: '直播间ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ description: '接收者ID' })
  @IsString()
  receiverId: string;

  @ApiProperty({ description: '礼物ID' })
  @IsString()
  giftId: string;

  @ApiProperty({ description: '礼物数量' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: '留言内容', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: '额外信息', required: false })
  @IsOptional()
  extra?: Record<string, any>;
}