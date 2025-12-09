import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ManagerUsersService } from './users.service';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('管理端-用户管理')
@Controller('manager/users')
export class ManagerUsersController {
  constructor(private readonly usersService: ManagerUsersService) {}

  @ApiOperation({ summary: '获取用户列表' })
  @Get()
  getUsers(@Query() query: QueryUserDto) {
    return this.usersService.getUsers(query);
  }

  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: '更新用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiBody({ type: UpdateUserDto })
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @ApiOperation({ summary: '批量删除用户' })
  @ApiBody({ schema: { properties: { ids: { type: 'array', items: { type: 'string' } } } } })
  @Post('batch-delete')
  batchDeleteUsers(@Body('ids') ids: string[]) {
    return this.usersService.batchDeleteUsers(ids);
  }

  @ApiOperation({ summary: '启用用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Put(':id/enable')
  enableUser(@Param('id') id: string) {
    return this.usersService.enableUser(id);
  }

  @ApiOperation({ summary: '禁用用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Put(':id/disable')
  disableUser(@Param('id') id: string) {
    return this.usersService.disableUser(id);
  }

  @ApiOperation({ summary: '重置用户密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiBody({ schema: { properties: { newPassword: { type: 'string' } } } })
  @Put(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @ApiOperation({ summary: '封禁用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Put(':id/ban')
  banUser(@Param('id') id: string) {
    return this.usersService.banUser(id);
  }
}
