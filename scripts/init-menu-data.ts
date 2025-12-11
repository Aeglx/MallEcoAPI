/**
 * 菜单数据初始化脚本
 * 将Java版的菜单结构迁移到API版，确保两者完全一致
 */

import { DataSource } from 'typeorm';
import { Menu } from '../modules/common/auth/entities/menu.entity';

/**
 * 管理端菜单数据（基于Java版li_menu表结构）
 */
const adminMenus = [
  // 系统管理
  {
    id: '1348810864748945408',
    title: '系统管理',
    name: 'system',
    path: '/system',
    level: 1,
    frontRoute: 'system/index',
    parentId: null,
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-settings',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'system:user:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'system:role:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'system:menu:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 商品管理
  {
    id: '1348810864748945412',
    title: '商品管理',
    name: 'goods',
    path: '/goods',
    level: 1,
    frontRoute: 'goods/index',
    parentId: null,
    sortOrder: 2.0,
    permission: '*',
    icon: 'ios-cube',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'goods:list:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'goods:category:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'goods:brand:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 订单管理
  {
    id: '1348810864748945416',
    title: '订单管理',
    name: 'order',
    path: '/order',
    level: 1,
    frontRoute: 'order/index',
    parentId: null,
    sortOrder: 3.0,
    permission: '*',
    icon: 'ios-list-box',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'order:list:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'order:after-sale:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 店铺管理
  {
    id: '1348810864748945419',
    title: '店铺管理',
    name: 'store',
    path: '/store',
    level: 1,
    frontRoute: 'store/index',
    parentId: null,
    sortOrder: 4.0,
    permission: '*',
    icon: 'ios-business',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'store:list:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'store:audit:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 营销管理
  {
    id: '1348810864748945422',
    title: '营销管理',
    name: 'marketing',
    path: '/marketing',
    level: 1,
    frontRoute: 'marketing/index',
    parentId: null,
    sortOrder: 5.0,
    permission: '*',
    icon: 'ios-megaphone',
    type: 0,
    status: 1,
    hidden: false
  },
  {
    id: '1348810864748945423',
    title: '优惠券管理',
    name: 'coupon-management',
    path: '/marketing/coupon',
    level: 2,
    frontRoute: 'marketing/coupon/index',
    parentId: '1348810864748945422',
    sortOrder: 5.1,
    permission: 'marketing:coupon:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'marketing:promotion:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 财务管理
  {
    id: '1348810864748945425',
    title: '财务管理',
    name: 'finance',
    path: '/finance',
    level: 1,
    frontRoute: 'finance/index',
    parentId: null,
    sortOrder: 6.0,
    permission: '*',
    icon: 'ios-calculator',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'finance:bill:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'finance:withdraw:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 内容管理
  {
    id: '1348810864748945428',
    title: '内容管理',
    name: 'content',
    path: '/content',
    level: 1,
    frontRoute: 'content/index',
    parentId: null,
    sortOrder: 7.0,
    permission: '*',
    icon: 'ios-document',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'content:article:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'content:page:*',
    type: 1,
    status: 1,
    hidden: false
  }
];

/**
 * 卖家端菜单数据（基于Java版li_store_menu表结构）
 */
const sellerMenus = [
  // 商品管理
  {
    id: '1348810864748945431',
    title: '商品管理',
    name: 'goods-seller',
    path: '/goods-seller',
    level: 1,
    frontRoute: 'goods-seller/index',
    parentId: null,
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-cube',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'goods:list:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'goods:add:*',
    type: 1,
    status: 1,
    hidden: false
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
    icon: 'ios-american-football',
    type: 1,
    status: 1,
    hidden: false
  },

  // 订单管理
  {
    id: '1348810864748945434',
    title: '订单管理',
    name: 'order-seller',
    path: '/order-seller',
    level: 1,
    frontRoute: 'order-seller/index',
    parentId: null,
    sortOrder: 2.0,
    permission: '*',
    icon: 'ios-list-box',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'order:list:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'order:after-sale:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 店铺管理
  {
    id: '1348810864748945437',
    title: '店铺管理',
    name: 'store-seller',
    path: '/store-seller',
    level: 1,
    frontRoute: 'store-seller/index',
    parentId: null,
    sortOrder: 3.0,
    permission: '*',
    icon: 'ios-business',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'store:setting:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'store:freight:*',
    type: 1,
    status: 1,
    hidden: false
  },

  // 财务管理
  {
    id: '1348810864748945440',
    title: '财务管理',
    name: 'finance-seller',
    path: '/finance-seller',
    level: 1,
    frontRoute: 'finance-seller/index',
    parentId: null,
    sortOrder: 4.0,
    permission: '*',
    icon: 'ios-calculator',
    type: 0,
    status: 1,
    hidden: false
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
    permission: 'finance:bill:*',
    type: 1,
    status: 1,
    hidden: false
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
    permission: 'finance:withdraw:*',
    type: 1,
    status: 1,
    hidden: false
  }
];

/**
 * 初始化菜单数据
 */
async function initMenuData(dataSource: DataSource) {
  const menuRepository = dataSource.getRepository(Menu);
  
  // 合并所有菜单数据
  const allMenus = [...adminMenus, ...sellerMenus];
  
  let createdCount = 0;
  let skippedCount = 0;
  
  console.log('开始初始化菜单数据...');
  
  for (const menuData of allMenus) {
    try {
      // 检查菜单是否已存在
      const existingMenu = await menuRepository.findOne({
        where: { title: menuData.title }
      });
      
      if (existingMenu) {
        console.log(`菜单已存在: ${menuData.title}`);
        skippedCount++;
        continue;
      }
      
      // 创建菜单
      const menu = menuRepository.create(menuData);
      await menuRepository.save(menu);
      
      console.log(`创建菜单成功: ${menuData.title}`);
      createdCount++;
      
    } catch (error) {
      console.error(`创建菜单失败: ${menuData.title}`, error);
    }
  }
  
  console.log(`菜单数据初始化完成! 创建: ${createdCount} 个, 跳过: ${skippedCount} 个`);
}

/**
 * 主函数
 */
async function main() {
  try {
    // 创建数据源连接
    const dataSource = new DataSource({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'malleco_api',
      entities: [Menu],
      synchronize: true,
      logging: false
    });
    
    await dataSource.initialize();
    console.log('数据库连接成功');
    
    // 初始化菜单数据
    await initMenuData(dataSource);
    
    await dataSource.destroy();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

// 如果是直接运行此文件
if (require.main === module) {
  main();
}

export { initMenuData, adminMenus, sellerMenus };