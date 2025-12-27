import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionSearchDto } from '../dto/permission-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('权限管理')
@Controller('rbac/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '权限创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: '查询权限列表' })
  @ApiResponse({ status: 200, description: '获取权限列表成功' })
  findAll(@Query() searchDto: PermissionSearchDto) {
    return this.permissionService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询权限' })
  @ApiResponse({ status: 200, description: '获取权限信息成功' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限信息' })
  @ApiResponse({ status: 200, description: '权限信息更新成功' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '权限删除成功' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取权限树形结构' })
  @ApiResponse({ status: 200, description: '获取权限树成功' })
  getPermissionTree() {
    return this.permissionService.getPermissionTree();
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取拥有该权限的角色列表' })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  getPermissionRoles(@Param('id') id: string) {
    return this.permissionService.getPermissionRoles(+id);
  }
}
