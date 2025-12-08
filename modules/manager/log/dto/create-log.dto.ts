import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { LogType, LogOperationType } from '../entities/log.entity';

export class CreateLogDto {
  @IsEnum(LogType)
  type: LogType;

  @IsEnum(LogOperationType)
  operationType: LogOperationType;

  @IsOptional()
  @MaxLength(50)
  operatorId: string;

  @IsOptional()
  @MaxLength(50)
  operatorName: string;

  @IsOptional()
  @MaxLength(200)
  content: string;

  @IsOptional()
  @MaxLength(50)
  ip: string;

  @IsOptional()
  @MaxLength(20)
  method: string;

  @IsOptional()
  @MaxLength(200)
  path: string;

  @IsOptional()
  @IsNumber()
  statusCode: number;

  @IsOptional()
  requestParams: string;

  @IsOptional()
  responseData: string;

  @IsOptional()
  @IsNumber()
  executionTime: number;
}

// 日志查询DTO
export class QueryLogDto {
  @IsOptional()
  @IsEnum(LogType)
  type: LogType;

  @IsOptional()
  @IsEnum(LogOperationType)
  operationType: LogOperationType;

  @IsOptional()
  @MaxLength(50)
  operatorId: string;

  @IsOptional()
  @MaxLength(50)
  operatorName: string;

  @IsOptional()
  @MaxLength(50)
  ip: string;

  @IsOptional()
  startDate: Date;

  @IsOptional()
  endDate: Date;

  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}
