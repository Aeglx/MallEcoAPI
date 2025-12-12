import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Controller('auth/permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async getPermissions(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.permissionService.getPermissions(page, limit);
  }

  @Get(':id')
  async getPermission(@Param('id') id: string) {
    return this.permissionService.getPermission(id);
  }

  @Post()
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.createPermission(createPermissionDto);
  }

  @Put(':id')
  async updatePermission(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  async deletePermission(@Param('id') id: string) {
    return this.permissionService.deletePermission(id);
  }
}