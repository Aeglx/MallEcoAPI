import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { adminMenus, sellerMenus } from './data/menu-data';
import { MenuItem, MenuTree, WechatMenu } from './types/menu.types';

@Injectable()
export class MenuService implements OnModuleInit {
  private menuCache = new Map<string, MenuTree[]>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeMenus();
  }

  /**
   * 统一初始化所有菜单
   */
  async initializeMenus(): Promise<void> {
    console.log('🚀 开始初始化菜单系统...');
    
    try {
      // 构建管理端菜单树
      const adminMenuTree = this.buildMenuTree(adminMenus, 1);
      this.menuCache.set('admin', adminMenuTree);
      console.log(`✅ 管理端菜单初始化完成，共 ${adminMenuTree.length} 个顶级菜单`);

      // 构建卖家端菜单树
      const sellerMenuTree = this.buildMenuTree(sellerMenus, 2);
      this.menuCache.set('seller', sellerMenuTree);
      console.log(`✅ 卖家端菜单初始化完成，共 ${sellerMenuTree.length} 个顶级菜单`);

      // 初始化微信菜单
      await this.initializeWechatMenus();
      
      console.log('🎉 所有菜单初始化完成');
    } catch (error) {
      console.error('❌ 菜单初始化失败:', error);
    }
  }



  /**
   * 构建菜单树结构
   */
  private buildMenuTree(menus: MenuItem[], appType: number): MenuTree[] {
    const topLevelMenus = menus.filter(menu => 
      menu.level === 0 && menu.appType === appType
    );

    return topLevelMenus.map(topMenu => {
      const children = this.getChildrenMenus(menus, topMenu.id, appType);
      
      return {
        ...topMenu,
        children: children.length > 0 ? children : undefined
      };
    }).sort((a, b) => {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }

  /**
   * 获取子菜单
   */
  private getChildrenMenus(menus: MenuItem[], parentId: string, appType: number): MenuTree[] {
    return menus
      .filter(menu => menu.parentId === parentId && menu.appType === appType)
      .map(menu => {
        const children = this.getChildrenMenus(menus, menu.id, appType);
        
        return {
          ...menu,
          children: children.length > 0 ? children : undefined
        };
      })
      .sort((a, b) => {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }

  /**
   * 显示微信菜单统计信息
   */
  private displayWechatMenuStats(wechatMenus: MenuItem[]): void {
    const categorizedMenus = this.categorizeWechatMenus(wechatMenus);
    
    console.log('📊 微信菜单统计信息:');
    console.log(`🎯 总模块数: ${Object.keys(categorizedMenus).length}`);
    console.log(`📋 总菜单项: ${wechatMenus.length}`);
    console.log(`🔗 权限配置: ${wechatMenus.filter(m => m.permission).length} 个`);
    
    Object.keys(categorizedMenus).forEach(category => {
      const categoryInfo = categorizedMenus[category];
      console.log(`\n${this.getCategoryIcon(category)} ${category}`);
      console.log(`└── 路径: /admin/wechat/${categoryInfo.path}`);
      
      if (categoryInfo.submenus && categoryInfo.submenus.length > 0) {
        categoryInfo.submenus.forEach(submenu => {
          console.log(`    ├── ${submenu.title}`);
          console.log(`    │   └── 权限: ${submenu.permission}`);
        });
      }
    });
  }

  /**
   * 分类微信菜单
   */
  private categorizeWechatMenus(menus: MenuItem[]): Record<string, any> {
    const categories = {};
    
    menus.forEach(menu => {
      if (menu.level === 1 && menu.parentId === 'admin-wechat') {
        const categoryName = menu.title;
        const categoryPath = menu.path.replace('/admin/wechat/', '');
        
        categories[categoryName] = {
          path: categoryPath,
          submenus: menus.filter(m => m.parentId === menu.id)
        };
      }
    });
    
    return categories;
  }

  /**
   * 获取分类图标
   */
  private getCategoryIcon(category: string): string {
    const icons = {
      '消息管理': '💬',
      'H5网页': '📱',
      '微信卡券': '🎫',
      '素材管理': '🖼️',
      '自定义菜单': '📋',
      '授权管理': '🔑'
    };
    
    return icons[category] || '📄';
  }

  /**
   * 获取管理端菜单树
   */
  getAdminMenuTree(): MenuTree[] {
    return this.menuCache.get('admin') || [];
  }

  /**
   * 获取卖家端菜单树
   */
  getSellerMenuTree(): MenuTree[] {
    return this.menuCache.get('seller') || [];
  }

  /**
   * 获取微信菜单树
   */
  getWechatMenuTree(): MenuTree[] {
    return this.menuCache.get('wechat') || [];
  }

  /**
   * 获取微信菜单配置
   */
  getWechatMenu(): WechatMenu {
    const wechatMenus = this.menuCache.get('wechat') || [];
    
    // 将菜单树转换为微信菜单格式
    return {
      button: wechatMenus.map(menu => ({
        name: menu.title,
        type: 'view',
        url: menu.path,
        sub_button: menu.children ? menu.children.map(child => ({
          name: child.title,
          type: 'view',
          url: child.path
        })) : undefined
      }))
    };
  }

  /**
   * 初始化微信菜单
   */
  private async initializeWechatMenus(): Promise<void> {
    try {
      // 从管理端菜单中筛选出微信相关菜单
      const wechatMenus = adminMenus.filter(menu => 
        menu.parentId === 'admin-wechat' || menu.parentId?.startsWith('admin-wechat-')
      );
      
      // 构建微信菜单树
      const wechatMenuTree = this.buildMenuTree(wechatMenus, 1);
      this.menuCache.set('wechat', wechatMenuTree);
      
      console.log(`✅ 微信菜单初始化完成，共 ${wechatMenus.length} 个菜单项`);
      
      // 显示微信菜单统计
      this.displayWechatMenuStats(wechatMenus);
    } catch (error) {
      console.error('❌ 微信菜单初始化失败:', error);
    }
  }

  /**
   * 根据用户角色获取菜单
   */
  getUserMenuTree(userType: 'admin' | 'seller', permissions: string[]): MenuTree[] {
    const menuTree = userType === 'admin' ? this.getAdminMenuTree() : this.getSellerMenuTree();
    
    return this.filterMenuByPermissions(menuTree, permissions);
  }

  /**
   * 根据权限过滤菜单
   */
  private filterMenuByPermissions(menuTree: MenuTree[], permissions: string[]): MenuTree[] {
    return menuTree
      .map(menu => {
        const filteredChildren = menu.children 
          ? this.filterMenuByPermissions(menu.children, permissions)
          : undefined;
        
        // 如果菜单有权限要求，检查用户是否有权限
        if (menu.permission && !permissions.includes(menu.permission)) {
          return null;
        }
        
        // 如果有子菜单且子菜单被过滤后为空，则隐藏该菜单
        if (filteredChildren && filteredChildren.length === 0) {
          return null;
        }
        
        return {
          ...menu,
          children: filteredChildren
        };
      })
      .filter(menu => menu !== null) as MenuTree[];
  }
}