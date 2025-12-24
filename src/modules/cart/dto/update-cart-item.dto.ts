import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: '商品数量',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: '是否选中',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  selected?: boolean;
}
