import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuSearchDto } from '../dto/menu-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('权限管理 - 菜单管理')
@Controller('rbac/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, description: '菜单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: '查询菜单列表' })
  @ApiResponse({ status: 200, description: '获取菜单列表成功' })
  findAll(@Query() searchDto: MenuSearchDto) {
    return this.menuService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询菜单' })
  @ApiResponse({ status: 200, description: '获取菜单信息成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新菜单信息' })
  @ApiResponse({ status: 200, description: '菜单信息更新成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(+id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 200, description: '菜单删除成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树形结构' })
  @ApiResponse({ status: 200, description: '获取菜单树成功' })
  getMenuTree() {
    return this.menuService.getMenuTree();
  }

  @Post('sort')
  @ApiOperation({ summary: '菜单排序' })
  @ApiResponse({ status: 200, description: '菜单排序成功' })
  sortMenus(@Body() sortedIds: number[]) {
    return this.menuService.sortMenus(sortedIds);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取菜单关联的权限' })
  @ApiResponse({ status: 200, description: '获取菜单权限成功' })
  getMenuPermissions(@Param('id') id: string) {
    return this.menuService.getMenuPermissions(+id);
  }
}
