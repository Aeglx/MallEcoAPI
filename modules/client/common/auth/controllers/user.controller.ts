import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';

@Controller('auth/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userService.getUsers(page, limit);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Post(':id/roles')
  async assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.userService.assignRoles(id, assignRolesDto.roleIds);
  }

  @Delete(':id/roles')
  async removeRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.userService.removeRoles(id, assignRolesDto.roleIds);
  }

  @Put(':id/status')
  async updateUserStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.userService.updateUserStatus(id, status);
  }

  @Get(':id/permissions')
  async getUserPermissions(@Param('id') id: string) {
    return this.userService.getUserPermissions(id);
  }
}