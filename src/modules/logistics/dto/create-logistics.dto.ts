import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLogisticsDto {
  @ApiProperty({ description: '物流公司名称', required: true })
  @IsNotEmpty({ message: '物流公司名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '物流公司code', required: true })
  @IsNotEmpty({ message: '物流公司code不能为空' })
  @IsString()
  code: string;

  @ApiProperty({ description: '支持电子面单 Y/N', required: false, default: 'N' })
  @IsOptional()
  @IsString()
  standBy?: string;

  @ApiProperty({ description: '物流公司电子面单表单', required: false })
  @IsOptional()
  @IsString()
  formItems?: string;

  @ApiProperty({
    description: '禁用状态 OPEN：开启，CLOSE：禁用',
    required: false,
    default: 'OPEN',
  })
  @IsOptional()
  @IsString()
  disabled?: string;
}
