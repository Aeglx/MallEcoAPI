import { IsOptional, IsNumber, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于等于1' })
  page: number = 1;

  @IsOptional()
  @IsNumber({}, { message: '每页条数必须是数字' })
  @Min(1, { message: '每页条数必须大于等于1' })
  pageSize: number = 10;

  @IsOptional()
  keyword?: string;
}
