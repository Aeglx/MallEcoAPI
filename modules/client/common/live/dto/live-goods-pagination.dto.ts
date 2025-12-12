import { PaginationDto } from '../../dto/pagination.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LiveGoodsPaginationDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  liveRoomId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isOnSale?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}