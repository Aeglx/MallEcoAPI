import { IsOptional, IsString, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDistributorDto {
  @IsOptional()
  @IsString({ message: '分销商名称必须是字符串' })
  @ApiProperty({ name: 'distributorName', description: '分销商名称', example: '张三的店铺', required: false })
  distributorName?: string;

  @IsOptional()
  @IsNumber({}, { message: '分销商等级必须是数字' })
  @Min(0, { message: '分销商等级最小值为0' })
  @Max(2, { message: '分销商等级最大值为2' })
  @ApiProperty({ name: 'distributorLevel', description: '分销商等级：0-普通分销商，1-高级分销商，2-顶级分销商', example: 1, required: false })
  distributorLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(3, { message: '状态最大值为3' })
  @ApiProperty({ name: 'status', description: '状态：0-待审核，1-已通过，2-已拒绝，3-已冻结', example: 1, required: false })
  status?: number;

  @IsOptional()
  @IsString({ message: '审核备注必须是字符串' })
  @ApiProperty({ name: 'auditNote', description: '审核备注', example: '审核通过', required: false })
  auditNote?: string;
}
