import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  @MaxLength(50)
  key: string;

  @IsOptional()
  value: string;

  @IsOptional()
  @MaxLength(200)
  description: string;

  @IsOptional()
  @MaxLength(20)
  type: string;

  @IsOptional()
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @MaxLength(50)
  group: string;
}
