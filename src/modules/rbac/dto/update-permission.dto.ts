import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}