import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ description: '文件名称', required: true })
  @IsNotEmpty({ message: '文件名称不能为空' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: '文件URL', required: true })
  @IsNotEmpty({ message: '文件URL不能为空' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: '文件路径', required: true })
  @IsNotEmpty({ message: '文件路径不能为空' })
  @IsString()
  filePath: string;

  @ApiProperty({ description: '文件大小（字节）', required: true })
  @IsNotEmpty({ message: '文件大小不能为空' })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ description: '文件类型', required: true })
  @IsNotEmpty({ message: '文件类型不能为空' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: '存储类型', required: false, default: 'local' })
  @IsOptional()
  @IsString()
  storageType?: string;

  @ApiProperty({ description: '目录ID', required: false })
  @IsOptional()
  @IsString()
  directoryId?: string;

  @ApiProperty({ description: '文件哈希值', required: false })
  @IsOptional()
  @IsString()
  fileHash?: string;

  @ApiProperty({ description: '文件扩展名', required: true })
  @IsNotEmpty({ message: '文件扩展名不能为空' })
  @IsString()
  fileExt: string;

  @ApiProperty({ description: '上传者ID', required: false })
  @IsOptional()
  @IsString()
  uploaderId?: string;

  @ApiProperty({ description: '文件描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
