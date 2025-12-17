import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatMenuService } from '../services/wechat-menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { CreateMenuKeywordDto } from '../dto/create-menu-keyword.dto';
import { UpdateMenuKeywordDto } from '../dto/update-menu-keyword.dto';
import { QueryMenuDto } from '../dto/query-menu.dto';
import { QueryMenuKeywordDto } from '../dto/query-menu-keyword.dto';

@ApiTags('公众号管理-自定义菜单')
@Controller('admin/wechat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatMenuController {
  constructor(private readonly wechatMenuService: WechatMenuService) {}

  // 菜单管理
  @Get('menus')
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResponse({ status: 200, description: '获取菜单列表成功' })
  getMenus(@Query() queryDto: QueryMenuDto) {
    return this.wechatMenuService.getMenus(queryDto);
  }

  @Get('menus/tree')
  @ApiOperation({ summary: '获取菜单树形结构' })
  @ApiResponse({ status: 200, description: '获取菜单树形结构成功' })
  getMenuTree() {
    return this.wechatMenuService.getMenuTree();
  }

  @Get('menus/:id')
  @ApiOperation({ summary: '获取菜单详情' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, description: '获取菜单详情成功' })
  getMenuById(@Param('id') id: string) {
    return this.wechatMenuService.getMenuById(id);
  }

  @Post('menus')
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, description: '菜单创建成功' })
  createMenu(@Body() createDto: CreateMenuDto) {
    return this.wechatMenuService.createMenu(createDto);
  }

  @Put('menus/:id')
  @ApiOperation({ summary: '更新菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, description: '菜单更新成功' })
  updateMenu(
    @Param('id') id: string,
    @Body() updateDto: UpdateMenuDto,
  ) {
    return this.wechatMenuService.updateMenu(id, updateDto);
  }

  @Delete('menus/:id')
  @ApiOperation({ summary: '删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, description: '菜单删除成功' })
  deleteMenu(@Param('id') id: string) {
    return this.wechatMenuService.deleteMenu(id);
  }

  @Post('menus/:id/publish')
  @ApiOperation({ summary: '发布菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, description: '菜单发布成功' })
  publishMenu(@Param('id') id: string) {
    return this.wechatMenuService.publishMenu(id);
  }

  @Post('menus/:id/unpublish')
  @ApiOperation({ summary: '取消发布菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, description: '菜单取消发布成功' })
  unpublishMenu(@Param('id') id: string) {
    return this.wechatMenuService.unpublishMenu(id);
  }

  // 菜单关键词管理
  @Get('menu-keywords')
  @ApiOperation({ summary: '获取菜单关键词列表' })
  @ApiResponse({ status: 200, description: '获取菜单关键词列表成功' })
  getMenuKeywords(@Query() queryDto: QueryMenuKeywordDto) {
    return this.wechatMenuService.getMenuKeywords(queryDto);
  }

  @Get('menu-keywords/:id')
  @ApiOperation({ summary: '获取菜单关键词详情' })
  @ApiParam({ name: 'id', description: '菜单关键词ID' })
  @ApiResponse({ status: 200, description: '获取菜单关键词详情成功' })
  getMenuKeywordById(@Param('id') id: string) {
    return this.wechatMenuService.getMenuKeywordById(id);
  }

  @Post('menu-keywords')
  @ApiOperation({ summary: '创建菜单关键词' })
  @ApiResponse({ status: 201, description: '菜单关键词创建成功' })
  createMenuKeyword(@Body() createDto: CreateMenuKeywordDto) {
    return this.wechatMenuService.createMenuKeyword(createDto);
  }

  @Put('menu-keywords/:id')
  @ApiOperation({ summary: '更新菜单关键词' })
  @ApiParam({ name: 'id', description: '菜单关键词ID' })
  @ApiResponse({ status: 200, description: '菜单关键词更新成功' })
  updateMenuKeyword(
    @Param('id') id: string,
    @Body() updateDto: UpdateMenuKeywordDto,
  ) {
    return this.wechatMenuService.updateMenuKeyword(id, updateDto);
  }

  @Delete('menu-keywords/:id')
  @ApiOperation({ summary: '删除菜单关键词' })
  @ApiParam({ name: 'id', description: '菜单关键词ID' })
  @ApiResponse({ status: 200, description: '菜单关键词删除成功' })
  deleteMenuKeyword(@Param('id') id: string) {
    return this.wechatMenuService.deleteMenuKeyword(id);
  }

  // 同步菜单到微信
  @Post('menus/sync')
  @ApiOperation({ summary: '同步菜单到微信' })
  @ApiResponse({ status: 200, description: '菜单同步成功' })
  syncMenuToWechat() {
    return this.wechatMenuService.syncMenuToWechat();
  }
}