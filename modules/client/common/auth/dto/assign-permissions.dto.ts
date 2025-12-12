import { IsNotEmpty, IsArray } from 'class-validator';

export class AssignPermissionsDto {
  @IsNotEmpty({ message: '权限ID列表不能为空' })
  @IsArray()
  permissionIds: string[];
}