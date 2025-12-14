import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLiveRoomDto {
  @ApiProperty({
    description: '直播间名称',
    example: '更新后的直播间',
    required: false,
  })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiProperty({
    description: '封面图片',
    example: 'https://example.com/new-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({
    description: '状态：0-未开播，1-直播中，2-已结束',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({
    description: '直播开始时间',
    example: '2025-12-15T10:00:00',
    required: false,
  })
  @IsOptional()
  startTime?: Date;

  @ApiProperty({
    description: '直播结束时间',
    example: '2025-12-15T12:00:00',
    required: false,
  })
  @IsOptional()
  endTime?: Date;

  @ApiProperty({
    description: '直播间描述',
    example: '更新后的直播间描述',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '标签',
    example: '服装,美妆,时尚',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}
