import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateWechatSubscribeDto {
  @ApiProperty({ description: '用户openid' })
  @IsNotEmpty()
  @IsString()
  openid: string;

  @ApiProperty({ description: '模板ID' })
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @ApiProperty({ description: '场景', required: false })
  @IsOptional()
  @IsString()
  scene?: string;

  @ApiProperty({ description: '状态：1-已订阅，2-拒收，3-已发送', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '订阅内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '模板数据', required: false })
  @IsOptional()
  templateData?: any;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '关联业务ID', required: false })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiProperty({ description: '关联业务类型', required: false })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({ description: '创建人ID' })
  @IsNotEmpty()
  @IsString()
  createById: string;

  @ApiProperty({ description: '更新人ID' })
  @IsNotEmpty()
  @IsString()
  updateById: string;
}