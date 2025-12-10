import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveChatDto {
  @ApiProperty({ description: '直播间ID', example: 'room123' })
  @IsNotEmpty({ message: '直播间ID不能为空' })
  @IsString({ message: '直播间ID必须是字符串' })
  liveRoomId: string;

  @ApiProperty({ description: '发送者ID', example: 'user456' })
  @IsNotEmpty({ message: '发送者ID不能为空' })
  @IsString({ message: '发送者ID必须是字符串' })
  senderId: string;

  @ApiProperty({ description: '发送者名称', example: '张三' })
  @IsNotEmpty({ message: '发送者名称不能为空' })
  @IsString({ message: '发送者名称必须是字符串' })
  senderName: string;

  @ApiProperty({ 
    description: '消息类型', 
    enum: ['TEXT', 'IMAGE', 'GIFT', 'SYSTEM'], 
    default: 'TEXT' 
  })
  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE', 'GIFT', 'SYSTEM'], { 
    message: '消息类型必须是TEXT、IMAGE、GIFT或SYSTEM' 
  })
  messageType?: string;

  @ApiProperty({ description: '消息内容', example: '这个商品真不错！' })
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '图片URL', example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imageUrl?: string;

  @ApiProperty({ description: '是否主播消息', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否主播消息必须是布尔值' })
  isAnchorMessage?: boolean;

  @ApiProperty({ description: '是否管理员消息', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否管理员消息必须是布尔值' })
  isAdminMessage?: boolean;
}