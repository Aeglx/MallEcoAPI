import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveRoomDto {
  @ApiProperty({
    description: '直播间名称',
    example: '测试直播间',
  })
  @IsNotEmpty()
  @IsString()
  roomName: string;

  @ApiProperty({
    description: '主播ID',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  anchorId: string;

  @ApiProperty({
    description: '主播名称',
    example: '测试主播',
  })
  @IsNotEmpty()
  @IsString()
  anchorName: string;

  @ApiProperty({
    description: '封面图片',
    example: 'https://example.com/cover.jpg',
  })
  @IsNotEmpty()
  @IsString()
  coverImage: string;

  @ApiProperty({
    description: '直播间描述',
    example: '这是一个测试直播间',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '标签',
    example: '服装,美妆',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}
