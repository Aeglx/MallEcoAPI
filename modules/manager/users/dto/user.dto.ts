import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsMobilePhone } from 'class-validator';

// 用户角色枚举
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MERCHANT = 'merchant',
}

// 查询用户DTO
export class QueryUserDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: '用户名',
    example: 'user123',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '手机号',
    example: '13800138000',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN')
  phone?: string;

  @ApiPropertyOptional({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '角色',
    example: UserRole.CUSTOMER,
    enum: UserRole,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: '是否活跃',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  isActive?: number;
}

// 创建用户DTO
export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'user123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: '密码',
    example: '123456',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: '手机号',
    example: '13800138000',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN')
  phone?: string;

  @ApiPropertyOptional({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: '用户123',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: '头像',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: '角色',
    example: UserRole.CUSTOMER,
    enum: UserRole,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: '是否活跃',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  isActive?: number;
}

// 更新用户DTO
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '密码',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: '手机号',
    example: '13800138000',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN')
  phone?: string;

  @ApiPropertyOptional({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: '用户123',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: '头像',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: '角色',
    example: UserRole.CUSTOMER,
    enum: UserRole,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: '是否活跃',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  isActive?: number;
}

// 用户详情响应DTO
export class UserDetailDto {
  @ApiProperty({
    description: '用户ID',
  })
  id: string;

  @ApiProperty({
    description: '用户名',
  })
  username: string;

  @ApiPropertyOptional({
    description: '手机号',
  })
  phone: string;

  @ApiPropertyOptional({
    description: '邮箱',
  })
  email: string;

  @ApiPropertyOptional({
    description: '昵称',
  })
  nickname: string;

  @ApiPropertyOptional({
    description: '头像',
  })
  avatar: string;

  @ApiProperty({
    description: '角色',
  })
  role: string;

  @ApiProperty({
    description: '是否活跃',
  })
  isActive: number;

  @ApiPropertyOptional({
    description: '最后登录时间',
  })
  lastLoginTime: Date;

  @ApiProperty({
    description: '创建时间',
  })
  createTime: Date;

  @ApiProperty({
    description: '更新时间',
  })
  updateTime: Date;
}

// 用户列表响应DTO
export class UserListDto {
  @ApiProperty({
    description: '用户列表',
  })
  data: UserDetailDto[];

  @ApiProperty({
    description: '总数',
  })
  total: number;

  @ApiProperty({
    description: '页码',
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
  })
  limit: number;
}
