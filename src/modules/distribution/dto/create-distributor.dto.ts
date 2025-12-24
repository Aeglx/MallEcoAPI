import { IsNotEmpty, IsString, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDistributorDto {
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsString({ message: '用户ID必须是字符串' })
  @ApiProperty({ name: 'userId', description: '用户ID', example: '1234567890abcdef12345678', required: true })
  userId: string;

  @IsNotEmpty({ message: '分销商名称不能为空' })
  @IsString({ message: '分销商名称必须是字符串' })
  @ApiProperty({ name: 'distributorName', description: '分销商名称', example: '张三的店铺', required: true })
  distributorName: string;

  @IsOptional()
  @IsNumber({}, { message: '分销商等级必须是数字' })
  @Min(0, { message: '分销商等级最小值为0' })
  @Max(2, { message: '分销商等级最大值为2' })
  @ApiProperty({ name: 'distributorLevel', description: '分销商等级：0-普通分销商，1-高级分销商，2-顶级分销商', example: 0, required: false })
  distributorLevel: number;

  @IsOptional()
  @IsString({ message: '邀请人ID必须是字符串' })
  @ApiProperty({ name: 'inviterId', description: '邀请人ID', example: '1234567890abcdef12345679', required: false })
  inviterId: string;
}
