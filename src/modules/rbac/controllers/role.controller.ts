import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleSearchDto } from '../dto/role-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('角色管理')
@Controller('rbac/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '查询角色列表' })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  findAll(@Query() searchDto: RoleSearchDto) {
    return this.roleService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询角色' })
  @ApiResponse({ status: 200, description: '获取角色信息成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色信息' })
  @ApiResponse({ status: 200, description: '角色信息更新成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '角色删除成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: '为角色分配权限' })
  @ApiResponse({ status: 200, description: '权限分配成功' })
  assignPermissions(
    @Param('id') id: string,
    @Body() { permissionIds }: { permissionIds: number[] },
  ) {
    return this.roleService.assignPermissions(+id, permissionIds);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取角色权限列表' })
  @ApiResponse({ status: 200, description: '获取角色权限成功' })
  getRolePermissions(@Param('id') id: string) {
    return this.roleService.getRolePermissions(+id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: '获取角色下的用户列表' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  getRoleUsers(@Param('id') id: string) {
    return this.roleService.getRoleUsers(+id);
  }
}
