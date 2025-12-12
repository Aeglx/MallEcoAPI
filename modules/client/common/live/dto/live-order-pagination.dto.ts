import { PaginationDto } from '../../dto/pagination.dto';
import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class LiveOrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  liveRoomId?: number;

  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}