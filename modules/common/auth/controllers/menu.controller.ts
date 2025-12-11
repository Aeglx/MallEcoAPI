import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { MenuService } from '../services/menu.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

@Controller('auth/menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async getMenus(@Query('type') type?: string, @Query('appType') appType?: number) {
    return this.menuService.getMenus(type, appType);
  }

  @Get('tree')
  async getMenuTree(@Query('appType') appType?: number) {
    return this.menuService.getMenuTree(appType);
  }

  @Get('admin/tree')
  async getAdminMenuTree() {
    return this.menuService.getMenuTree(1);
  }

  @Get('seller/tree')
  async getSellerMenuTree() {
    return this.menuService.getMenuTree(2);
  }

  @Get(':id')
  async getMenu(@Param('id') id: string) {
    return this.menuService.getMenu(id);
  }

  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto);
  }

  @Put(':id')
  async updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, updateMenuDto);
  }

  @Delete(':id')
  async deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }

  @Get(':id/permissions')
  async getMenuPermissions(@Param('id') id: string) {
    return this.menuService.getMenuPermissions(id);
  }

  @Post(':id/permissions')
  async assignMenuPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: string[]) {
    return this.menuService.assignMenuPermissions(id, permissionIds);
  }
}