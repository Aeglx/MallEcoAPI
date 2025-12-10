import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class SearchSuggestDto {
  @ApiProperty({ description: '搜索关键词', example: '手机' })
  @IsString()
  keyword: string;

  @ApiPropertyOptional({ description: '限制数量', example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class SearchSuggestResponseDto {
  @ApiProperty({ description: '搜索建议列表' })
  suggestions: string[];
}