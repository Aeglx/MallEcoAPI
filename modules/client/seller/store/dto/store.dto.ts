import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUrl, IsEnum } from 'class-validator';

// 创建店铺DTO
export class CreateStoreDto {
  @ApiProperty({ description: '店铺名称', example: '我的小店' })
  @IsNotEmpty()
  @IsString()
  storeName: string;

  @ApiProperty({ description: '店铺类型', example: 'INDIVIDUAL' })
  @IsNotEmpty()
  @IsString()
  storeType: string;

  @ApiProperty({ description: '联系人', example: '张三' })
  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @ApiProperty({ description: '联系电话', example: '13800138000' })
  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @ApiProperty({ description: '店铺描述', example: '这是我的个人小店', required: false })
  @IsOptional()
  @IsString()
  storeDescription?: string;
}

// 更新店铺DTO
export class UpdateStoreDto {
  @ApiProperty({ description: '店铺名称', example: '我的小店', required: false })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiProperty({ description: '店铺描述', example: '这是我的个人小店', required: false })
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiProperty({ description: '店铺Logo', example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  storeLogo?: string;

  @ApiProperty({ description: '店铺横幅', example: 'https://example.com/banner.png', required: false })
  @IsOptional()
  @IsUrl()
  storeBanner?: string;

  @ApiProperty({ description: '联系人', example: '张三', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}

// 查询店铺DTO
export class QueryStoreDto {
  @ApiProperty({ description: '店铺名称', example: '我的小店', required: false })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiProperty({ description: '店铺状态', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  storeStatus?: number;

  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页条数', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  pageSize?: number = 10;
}
