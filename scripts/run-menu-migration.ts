/**
 * 菜单迁移脚本 - 使用NestJS应用上下�?
 * 运行方式: npx ts-node scripts/run-menu-migration.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MenuService } from '../modules/client/common/auth/services/menu.service';

/**
 * Java版菜单数据结�?
 */
interface JavaMenuData {
  id: string;
  title: string;
  name: string;
  path: string;
  level: number;
  frontRoute: string;
  parentId: string;
  sortOrder: number;
  permission: string;
  icon?: string;
  description?: string;
}

/**
 * 管理端菜单数�?
 */
const adminMenus: JavaMenuData[] = [
  // 系统管理
  {
    id: '1348810864748945408',
    title: '系统管理',
    name: 'system',
    path: '/system',
    level: 1,
    frontRoute: 'system/index',
    parentId: '0',
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-settings'
  },
  {
    id: '1348810864748945409',
    title: '用户管理',
    name: 'user-management',
    path: '/system/user',
    level: 2,
    frontRoute: 'system/user/index',
    parentId: '1348810864748945408',
    sortOrder: 1.1,
    permission: 'system:user:*'
  },
  {
    id: '1348810864748945410',
    title: '角色管理',
    name: 'role-management',
    path: '/system/role',
    level: 2,
    frontRoute: 'system/role/index',
    parentId: '1348810864748945408',
    sortOrder: 1.2,
    permission: 'system:role:*'
  },
  {
    id: '1348810864748945411',
    title: '菜单管理',
    name: 'menu-management',
    path: '/system/menu',
    level: 2,
    frontRoute: 'system/menu/index',
    parentId: '1348810864748945408',
    sortOrder: 1.3,
    permission: 'system:menu:*'
  },

  // 商品管理
  {
    id: '1348810864748945412',
    title: '商品管理',
    name: 'goods',
    path: '/goods',
    level: 1,
    frontRoute: 'goods/index',
    parentId: '0',
    sortOrder: 2.0,
    permission: '*',
    icon: 'ios-cube'
  },
  {
    id: '1348810864748945413',
    title: '商品列表',
    name: 'goods-list',
    path: '/goods/list',
    level: 2,
    frontRoute: 'goods/goods-list/index',
    parentId: '1348810864748945412',
    sortOrder: 2.1,
    permission: 'goods:list:*'
  },
  {
    id: '1348810864748945414',
    title: '商品分类',
    name: 'goods-category',
    path: '/goods/category',
    level: 2,
    frontRoute: 'goods/category/index',
    parentId: '1348810864748945412',
    sortOrder: 2.2,
    permission: 'goods:category:*'
  },
  {
    id: '1348810864748945415',
    title: '品牌管理',
    name: 'brand-management',
    path: '/goods/brand',
    level: 2,
    frontRoute: 'goods/brand/index',
    parentId: '1348810864748945412',
    sortOrder: 2.3,
    permission: 'goods:brand:*'
  },

  // 订单管理
  {
    id: '1348810864748945416',
    title: '订单管理',
    name: 'order',
    path: '/order',
    level: 1,
    frontRoute: 'order/index',
    parentId: '0',
    sortOrder: 3.0,
    permission: '*',
    icon: 'ios-list-box'
  },
  {
    id: '1348810864748945417',
    title: '订单列表',
    name: 'order-list',
    path: '/order/list',
    level: 2,
    frontRoute: 'order/order-list/index',
    parentId: '1348810864748945416',
    sortOrder: 3.1,
    permission: 'order:list:*'
  },
  {
    id: '1348810864748945418',
    title: '售后管理',
    name: 'after-sale',
    path: '/order/after-sale',
    level: 2,
    frontRoute: 'order/after-sale/index',
    parentId: '1348810864748945416',
    sortOrder: 3.2,
    permission: 'order:after-sale:*'
  },

  // 店铺管理
  {
    id: '1348810864748945419',
    title: '店铺管理',
    name: 'store',
    path: '/store',
    level: 1,
    frontRoute: 'store/index',
    parentId: '0',
    sortOrder: 4.0,
    permission: '*',
    icon: 'ios-business'
  },
  {
    id: '1348810864748945420',
    title: '店铺列表',
    name: 'store-list',
    path: '/store/list',
    level: 2,
    frontRoute: 'store/store-list/index',
    parentId: '1348810864748945419',
    sortOrder: 4.1,
    permission: 'store:list:*'
  },
  {
    id: '1348810864748945421',
    title: '店铺审核',
    name: 'store-audit',
    path: '/store/audit',
    level: 2,
    frontRoute: 'store/audit/index',
    parentId: '1348810864748945419',
    sortOrder: 4.2,
    permission: 'store:audit:*'
  },

  // 营销管理
  {
    id: '1348810864748945422',
    title: '营销管理',
    name: 'marketing',
    path: '/marketing',
    level: 1,
    frontRoute: 'marketing/index',
    parentId: '0',
    sortOrder: 5.0,
    permission: '*',
    icon: 'ios-megaphone'
  },
  {
    id: '1348810864748945423',
    title: '优惠券管�?,
    name: 'coupon-management',
    path: '/marketing/coupon',
    level: 2,
    frontRoute: 'marketing/coupon/index',
    parentId: '1348810864748945422',
    sortOrder: 5.1,
    permission: 'marketing:coupon:*'
  },
  {
    id: '1348810864748945424',
    title: '促销活动',
    name: 'promotion',
    path: '/marketing/promotion',
    level: 2,
    frontRoute: 'marketing/promotion/index',
    parentId: '1348810864748945422',
    sortOrder: 5.2,
    permission: 'marketing:promotion:*'
  },

  // 财务管理
  {
    id: '1348810864748945425',
    title: '财务管理',
    name: 'finance',
    path: '/finance',
    level: 1,
    frontRoute: 'finance/index',
    parentId: '0',
    sortOrder: 6.0,
    permission: '*',
    icon: 'ios-calculator'
  },
  {
    id: '1348810864748945426',
    title: '账单管理',
    name: 'bill-management',
    path: '/finance/bill',
    level: 2,
    frontRoute: 'finance/bill/index',
    parentId: '1348810864748945425',
    sortOrder: 6.1,
    permission: 'finance:bill:*'
  },
  {
    id: '1348810864748945427',
    title: '提现管理',
    name: 'withdraw-management',
    path: '/finance/withdraw',
    level: 2,
    frontRoute: 'finance/withdraw/index',
    parentId: '1348810864748945425',
    sortOrder: 6.2,
    permission: 'finance:withdraw:*'
  },

  // 内容管理
  {
    id: '1348810864748945428',
    title: '内容管理',
    name: 'content',
    path: '/content',
    level: 1,
    frontRoute: 'content/index',
    parentId: '0',
    sortOrder: 7.0,
    permission: '*',
    icon: 'ios-document'
  },
  {
    id: '1348810864748945429',
    title: '文章管理',
    name: 'article-management',
    path: '/content/article',
    level: 2,
    frontRoute: 'content/article/index',
    parentId: '1348810864748945428',
    sortOrder: 7.1,
    permission: 'content:article:*'
  },
  {
    id: '1348810864748945430',
    title: '页面管理',
    name: 'page-management',
    path: '/content/page',
    level: 2,
    frontRoute: 'content/page/index',
    parentId: '1348810864748945428',
    sortOrder: 7.2,
    permission: 'content:page:*'
  }
];

/**
 * 卖家端菜单数�?
 */
const sellerMenus: JavaMenuData[] = [
  // 商品管理
  {
    id: '1348810864748945431',
    title: '商品管理',
    name: 'goods-seller',
    path: '/goods-seller',
    level: 1,
    frontRoute: 'goods-seller/index',
    parentId: '0',
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-cube'
  },
  {
    id: '1348810864748945432',
    title: '商品列表',
    name: 'goods-list-seller',
    path: '/goods-seller/list',
    level: 2,
    frontRoute: 'goods/goods-seller/goods-list',
    parentId: '1348810864748945431',
    sortOrder: 1.1,
    permission: 'goods:list:*'
  },
  {
    id: '1348810864748945433',
    title: '发布商品',
    name: 'add-goods-seller',
    path: '/goods-seller/add',
    level: 2,
    frontRoute: 'goods/goods-seller/add-goods',
    parentId: '1348810864748945431',
    sortOrder: 1.2,
    permission: 'goods:add:*'
  },
  {
    id: '1349237928434098177',
    title: '库存预警',
    name: 'alert-goods-quantity',
    path: 'alert-goods-quantity',
    level: 2,
    frontRoute: 'goods/goods-seller/alertQuantity',
    parentId: '1348810864748945431',
    sortOrder: 1.14,
    permission: null,
    icon: 'ios-american-football'
  },

  // 订单管理
  {
    id: '1348810864748945434',
    title: '订单管理',
    name: 'order-seller',
    path: '/order-seller',
    level: 1,
    frontRoute: 'order-seller/index',
    parentId: '0',
    sortOrder: 2.0,
    permission: '*',
    icon: 'ios-list-box'
  },
  {
    id: '1348810864748945435',
    title: '订单列表',
    name: 'order-list-seller',
    path: '/order-seller/list',
    level: 2,
    frontRoute: 'order/order-seller/order-list',
    parentId: '1348810864748945434',
    sortOrder: 2.1,
    permission: 'order:list:*'
  },
  {
    id: '1348810864748945436',
    title: '售后管理',
    name: 'after-sale-seller',
    path: '/order-seller/after-sale',
    level: 2,
    frontRoute: 'order/order-seller/after-sale',
    parentId: '1348810864748945434',
    sortOrder: 2.2,
    permission: 'order:after-sale:*'
  },

  // 店铺管理
  {
    id: '1348810864748945437',
    title: '店铺管理',
    name: 'store-seller',
    path: '/store-seller',
    level: 1,
    frontRoute: 'store-seller/index',
    parentId: '0',
    sortOrder: 3.0,
    permission: '*',
    icon: 'ios-business'
  },
  {
    id: '1348810864748945438',
    title: '店铺设置',
    name: 'store-setting',
    path: '/store-seller/setting',
    level: 2,
    frontRoute: 'store/store-seller/store-setting',
    parentId: '1348810864748945437',
    sortOrder: 3.1,
    permission: 'store:setting:*'
  },
  {
    id: '1348810864748945439',
    title: '运费模板',
    name: 'freight-template',
    path: '/store-seller/freight',
    level: 2,
    frontRoute: 'store/store-seller/freight-template',
    parentId: '1348810864748945437',
    sortOrder: 3.2,
    permission: 'store:freight:*'
  },

  // 财务管理
  {
    id: '1348810864748945440',
    title: '财务管理',
    name: 'finance-seller',
    path: '/finance-seller',
    level: 1,
    frontRoute: 'finance-seller/index',
    parentId: '0',
    sortOrder: 4.0,
    permission: '*',
    icon: 'ios-calculator'
  },
  {
    id: '1348810864748945441',
    title: '账单管理',
    name: 'bill-management-seller',
    path: '/finance-seller/bill',
    level: 2,
    frontRoute: 'finance/finance-seller/bill-management',
    parentId: '1348810864748945440',
    sortOrder: 4.1,
    permission: 'finance:bill:*'
  },
  {
    id: '1348810864748945442',
    title: '提现管理',
    name: 'withdraw-management-seller',
    path: '/finance-seller/withdraw',
    level: 2,
    frontRoute: 'finance/finance-seller/withdraw-management',
    parentId: '1348810864748945440',
    sortOrder: 4.2,
    permission: 'finance:withdraw:*'
  }
];

async function bootstrap() {
  console.log('开始启动NestJS应用上下�?..');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const menuService = app.get(MenuService);

  console.log('开始迁移Java版菜单数据到API�?..');

  // 合并所有菜单数�?
  const allMenus = [...adminMenus, ...sellerMenus];
  let createdCount = 0;
  let skippedCount = 0;

  for (const javaMenu of allMenus) {
    try {
      // 转换为API版的菜单格式（与Java版结构保持一致）
      const apiMenuData = {
        title: javaMenu.title,
        name: javaMenu.name,
        path: javaMenu.path,
        level: javaMenu.level,
        frontRoute: javaMenu.frontRoute,
        parentId: javaMenu.parentId === '0' ? null : javaMenu.parentId,
        sortOrder: javaMenu.sortOrder,
        permission: javaMenu.permission,
        icon: javaMenu.icon,
        description: javaMenu.description,
        type: javaMenu.level === 1 ? 0 : 1, // 0-目录 1-菜单
        status: 1, // 启用状�?
        hidden: false
      };

      // 检查菜单是否已存在
      const existingMenu = await menuService.getMenus();
      const existing = existingMenu.items.find(item => item.title === javaMenu.title);

      if (!existing) {
        console.log(`创建菜单: ${javaMenu.title}`);
        await menuService.createMenu(apiMenuData as any);
        createdCount++;
      } else {
        console.log(`菜单已存�? ${javaMenu.title}`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`创建菜单失败: ${javaMenu.title}`, error);
    }
  }

  console.log(`菜单数据迁移完成! 创建: ${createdCount} �? 跳过: ${skippedCount} 个`);
  
  await app.close();
  console.log('应用上下文已关闭');
}

bootstrap().catch(error => {
  console.error('迁移失败:', error);
  process.exit(1);
});
