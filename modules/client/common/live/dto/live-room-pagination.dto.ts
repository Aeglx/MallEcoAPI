import { PaginationDto } from '../../dto/pagination.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LiveRoomPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  anchorId?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}