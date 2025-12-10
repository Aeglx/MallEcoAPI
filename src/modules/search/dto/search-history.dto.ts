import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class SaveSearchHistoryDto {
  @ApiProperty({ description: '用户ID', example: '1' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '搜索关键词', example: '手机' })
  @IsString()
  keyword: string;
}

export class GetSearchHistoryDto {
  @ApiPropertyOptional({ description: '限制数量', example: 20, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchHistoryResponseDto {
  @ApiProperty({ description: '搜索历史列表' })
  history: string[];
}