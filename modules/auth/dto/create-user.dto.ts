import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsMobilePhone, 
  IsArray, 
  MinLength, 
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsMobilePhone()
  phone?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '角色ID列表', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({ description: '注册IP', required: false })
  @IsOptional()
  @IsString()
  registerIp?: string;

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;
}