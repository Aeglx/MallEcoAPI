import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsMobilePhone, 
  IsArray, 
  MinLength, 
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsMobilePhone()
  phone?: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '角色ID列表', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;
}