import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

/**
 * 更新订单状态DTO
 */
export class UpdateOrderStatusDto {
  @ApiProperty({
    description: '订单状态：0-待付款，1-待发货，2-待收货，3-待评价，4-已完成，5-已取消',
    example: 1,
    type: Number,
    minimum: 0,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  status: number;

  @ApiProperty({
    description: '管理员备注（可选）',
    example: '已确认付款',
    type: String,
    required: false,
  })
  adminNote?: string;
}
