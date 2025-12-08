import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { LogType, LogOperationType } from '../entities/log.entity';

export class CreateLogDto {
  @IsEnum(LogType)
  logType: LogType;

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
  ipAddress: string;

  @IsOptional()
  @MaxLength(20)
  requestMethod: string;

  @IsOptional()
  @MaxLength(200)
  requestUrl: string;

  @IsOptional()
  @IsNumber()
  responseCode: number;

  @IsOptional()
  requestParams: string;

  @IsOptional()
  responseData: string;

  @IsOptional()
  @IsNumber()
  responseTime: number;
}

// 日志查询DTO
export class QueryLogDto {
  @IsOptional()
  @IsEnum(LogType)
  logType: LogType;

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
  ipAddress: string;

  @IsOptional()
  startTime: Date;

  @IsOptional()
  endTime: Date;

  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}
