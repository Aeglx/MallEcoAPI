import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserSearchDto } from '../dto/user-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('用户管理')
@Controller('rbac/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '查询用户列表' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  findAll(@Query() searchDto: UserSearchDto) {
    return this.userService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询用户' })
  @ApiResponse({ status: 200, description: '获取用户信息成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '用户信息更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiResponse({ status: 200, description: '角色分配成功' })
  assignRoles(@Param('id') id: string, @Body() roleIds: number[]) {
    return this.userService.assignRoles(+id, roleIds);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取用户角色列表' })
  @ApiResponse({ status: 200, description: '获取用户角色成功' })
  getUserRoles(@Param('id') id: string) {
    return this.userService.getUserRoles(+id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取用户权限列表' })
  @ApiResponse({ status: 200, description: '获取用户权限成功' })
  getUserPermissions(@Param('id') id: string) {
    return this.userService.getUserPermissions(+id);
  }
}