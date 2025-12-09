import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDto {
  @ApiProperty({
    description: '房间名称',
    example: '技术交流群'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '房间描述',
    example: '欢迎加入技术交流群',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '房间头像',
    required: false
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: '房间类型',
    enum: ['private', 'group'],
    default: 'private'
  })
  @IsOptional()
  @IsEnum(['private', 'group'])
  type?: string;
}

export class UpdateChatRoomDto {
  @ApiProperty({
    description: '房间名称',
    example: '技术交流群',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '房间描述',
    example: '欢迎加入技术交流群',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '房间头像',
    required: false
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: '房间类型',
    enum: ['private', 'group'],
    required: false
  })
  @IsOptional()
  @IsEnum(['private', 'group'])
  type?: string;

  @ApiProperty({
    description: '是否删除',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class QueryChatRoomDto {
  @ApiProperty({
    description: '页码',
    default: 1,
    required: false
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: '每页数量',
    default: 10,
    required: false
  })
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: '房间类型',
    enum: ['private', 'group'],
    required: false
  })
  @IsOptional()
  @IsEnum(['private', 'group'])
  type?: string;

  @ApiProperty({
    description: '搜索关键词',
    required: false
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
