import { IsNotEmpty, IsArray } from 'class-validator';

export class AssignRolesDto {
  @IsNotEmpty({ message: '角色ID列表不能为空' })
  @IsArray()
  roleIds: string[];
}