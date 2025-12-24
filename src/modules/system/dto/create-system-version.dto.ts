import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean, IsDateString, IsIn } from 'class-validator';

export class CreateSystemVersionDto {
  @IsNotEmpty()
  @IsString()
  version: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['major', 'minor', 'patch', 'hotfix'])
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  features: any[];

  @IsArray()
  fixes: any[];

  @IsArray()
  improvements: any[];

  @IsOptional()
  @IsBoolean()
  isLts?: boolean;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  dependencies?: any;

  @IsOptional()
  @IsString()
  changelog?: string;

  @IsOptional()
  upgradeNotes?: any;

  @IsOptional()
  @IsString()
  @IsIn(['stable', 'beta', 'alpha', 'dev'])
  status?: string;

  @IsOptional()
  compatibility?: any;

  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @IsOptional()
  @IsString()
  checksum?: string;

  @IsOptional()
  fileSize?: number;
}