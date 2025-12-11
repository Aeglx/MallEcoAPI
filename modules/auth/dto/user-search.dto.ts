import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSearchDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    description: '用户状态',
    enum: ['active', 'inactive', 'banned'],
    required: false
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'])
  status?: string;

  @ApiProperty({ description: '角色ID', required: false })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页条数', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}