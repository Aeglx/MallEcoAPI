import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateFileDto {
  @ApiProperty({ description: '文件名称', required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ description: '文件URL', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: '文件路径', required: false })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiProperty({ description: '存储类型', required: false })
  @IsOptional()
  @IsString()
  storageType?: string;

  @ApiProperty({ description: '目录ID', required: false })
  @IsOptional()
  @IsString()
  directoryId?: string;

  @ApiProperty({ description: '文件描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '文件状态', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}
