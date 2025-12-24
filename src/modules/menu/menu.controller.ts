import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TransformInterceptor } from '../../shared/interceptors/transform.interceptor';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('菜单管理')
@Controller('menu')
@UseInterceptors(TransformInterceptor)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('admin')
  @ApiOperation({ summary: '获取管理端菜单树' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAdminMenuTree() {
    return this.menuService.getAdminMenuTree();
  }

  @Get('seller')
  @ApiOperation({ summary: '获取卖家端菜单树' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  getSellerMenuTree() {
    return this.menuService.getSellerMenuTree();
  }

  @Get('wechat')
  @ApiOperation({ summary: '获取微信菜单配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getWechatMenu() {
    return this.menuService.getWechatMenu();
  }

  @Get('user')
  @ApiOperation({ summary: '获取用户权限菜单' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'userType', enum: ['admin', 'seller'], description: '用户类型' })
  @ApiQuery({ name: 'permissions', type: [String], required: false, description: '用户权限列表' })
  @UseGuards(JwtAuthGuard)
  getUserMenuTree(
    @Query('userType') userType: 'admin' | 'seller',
    @Query('permissions') permissions?: string[]
  ) {
    const permissionList = permissions ? (Array.isArray(permissions) ? permissions : [permissions]) : [];
    return this.menuService.getUserMenuTree(userType, permissionList);
  }

  @Get('test')
  @ApiOperation({ summary: '测试菜单功能（公开端点）' })
  @ApiResponse({ status: 200, description: '测试成功' })
  testMenu() {
    return {
      success: true,
      message: '菜单模块功能正常',
      data: {
        adminMenuCount: this.menuService.getAdminMenuTree().length,
        sellerMenuCount: this.menuService.getSellerMenuTree().length,
        wechatMenu: this.menuService.getWechatMenu(),
        timestamp: new Date().toISOString()
      }
    };
  }
}