import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty({ message: '菜单标题不能为空' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsString()
  frontRoute?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  permission?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  hidden?: boolean;

  @IsOptional()
  @IsString()
  redirect?: string;
}