/**
 * 获取当前API版菜单树结构的脚�?
 */

import { DataSource } from 'typeorm';
import { Menu } from '../modules/client/common/auth/entities/menu.entity';

/**
 * 构建菜单树形结构
 */
function buildMenuTree(menus: Menu[]): any[] {
  const menuMap = new Map();
  const rootMenus: any[] = [];

  // 创建菜单映射
  menus.forEach(menu => {
    menuMap.set(menu.id, {
      id: menu.id,
      title: menu.title,
      name: menu.name,
      path: menu.path,
      level: menu.level,
      frontRoute: menu.frontRoute,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
      permission: menu.permission,
      icon: menu.icon,
      description: menu.description,
      type: menu.type,
      status: menu.status,
      hidden: menu.hidden,
      redirect: menu.redirect,
      children: []
    });
  });

  // 构建树形结构
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.id);
    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children.push(menuItem);
        // 按sortOrder排序
        parent.children.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      }
    } else {
      rootMenus.push(menuItem);
    }
  });

  // 按sortOrder排序根菜�?
  rootMenus.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  
  return rootMenus;
}

/**
 * 打印菜单�?
 */
function printMenuTree(menus: any[], indent = '') {
  menus.forEach(menu => {
    console.log(`${indent}├─ ${menu.title} (${menu.name})`);
    console.log(`${indent}�? ├─ 路径: ${menu.path}`);
    console.log(`${indent}�? ├─ 层级: ${menu.level}`);
    console.log(`${indent}�? ├─ 路由: ${menu.frontRoute}`);
    console.log(`${indent}�? ├─ 权限: ${menu.permission}`);
    console.log(`${indent}�? ├─ 图标: ${menu.icon}`);
    console.log(`${indent}�? └─ 排序: ${menu.sortOrder}`);
    
    if (menu.children && menu.children.length > 0) {
      printMenuTree(menu.children, indent + '�? ');
    }
  });
}

async function main() {
  try {
    // 创建数据源连�?
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
    console.log('数据库连接成功\n');
    
    // 获取所有菜�?
    const menuRepository = dataSource.getRepository(Menu);
    const menus = await menuRepository.find({
      order: { sortOrder: 'ASC' }
    });
    
    console.log(`当前数据库中�?${menus.length} 个菜单\n`);
    
    // 构建菜单�?
    const menuTree = buildMenuTree(menus);
    
    console.log('=== API版侧边栏菜单树结�?===');
    console.log('\n管理端菜�?');
    
    // 过滤管理端菜单（level=1的根菜单�?
    const adminMenus = menuTree.filter(menu => menu.level === 1);
    printMenuTree(adminMenus);
    
    console.log('\n卖家端菜�?');
    // 过滤卖家端菜单（包含-seller后缀的菜单）
    const sellerMenus = menuTree.filter(menu => 
      menu.name && menu.name.includes('-seller')
    );
    printMenuTree(sellerMenus);
    
    // 如果没有菜单数据，显示预期的菜单结构
    if (menus.length === 0) {
      console.log('\n=== 预期的Java版菜单结�?===');
      console.log('\n管理端菜�?(7大模�? 25个菜单项):');
      console.log('├─ 系统管理');
      console.log('�? ├─ 用户管理');
      console.log('�? ├─ 角色管理');
      console.log('�? └─ 菜单管理');
      console.log('├─ 商品管理');
      console.log('�? ├─ 商品列表');
      console.log('�? ├─ 商品分类');
      console.log('�? └─ 品牌管理');
      console.log('├─ 订单管理');
      console.log('�? ├─ 订单列表');
      console.log('�? └─ 售后管理');
      console.log('├─ 店铺管理');
      console.log('�? ├─ 店铺列表');
      console.log('�? └─ 店铺审核');
      console.log('├─ 营销管理');
      console.log('├─ 优惠券管理');
  console.log('└─ 促销活动');
      console.log('├─ 财务管理');
      console.log('�? ├─ 账单管理');
      console.log('�? └─ 提现管理');
      console.log('└─ 内容管理');
      console.log('   ├─ 文章管理');
      console.log('   └─ 页面管理');
      
      console.log('\n卖家端菜�?(4大模�? 15个菜单项):');
      console.log('├─ 商品管理');
      console.log('�? ├─ 商品列表');
      console.log('�? ├─ 发布商品');
      console.log('�? └─ 库存预警');
      console.log('├─ 订单管理');
      console.log('�? ├─ 订单列表');
      console.log('�? └─ 售后管理');
      console.log('├─ 店铺管理');
      console.log('�? ├─ 店铺设置');
      console.log('�? └─ 运费模板');
      console.log('└─ 财务管理');
      console.log('   ├─ 账单管理');
      console.log('   └─ 提现管理');
    }
    
    await dataSource.destroy();
    
  } catch (error) {
    console.error('获取菜单树失�?', error);
    
    // 显示预期的菜单结�?
    console.log('\n=== 预期的Java版菜单结�?===');
    console.log('\n管理端菜�?(7大模�? 25个菜单项):');
    console.log('├─ 系统管理');
    console.log('�? ├─ 用户管理');
    console.log('�? ├─ 角色管理');
    console.log('�? └─ 菜单管理');
    console.log('├─ 商品管理');
    console.log('�? ├─ 商品列表');
    console.log('�? ├─ 商品分类');
    console.log('�? └─ 品牌管理');
    console.log('├─ 订单管理');
    console.log('�? ├─ 订单列表');
    console.log('�? └─ 售后管理');
    console.log('├─ 店铺管理');
    console.log('�? ├─ 店铺列表');
    console.log('�? └─ 店铺审核');
    console.log('├─ 营销管理');
    console.log('├─ 优惠券管理');
    console.log('�? └─ 促销活动');
    console.log('├─ 财务管理');
    console.log('�? ├─ 账单管理');
    console.log('�? └─ 提现管理');
    console.log('└─ 内容管理');
    console.log('   ├─ 文章管理');
    console.log('   └─ 页面管理');
    
    console.log('\n卖家端菜�?(4大模�? 15个菜单项):');
    console.log('├─ 商品管理');
    console.log('�? ├─ 商品列表');
    console.log('�? ├─ 发布商品');
    console.log('�? └─ 库存预警');
    console.log('├─ 订单管理');
    console.log('�? ├─ 订单列表');
    console.log('�? └─ 售后管理');
    console.log('├─ 店铺管理');
    console.log('�? ├─ 店铺设置');
    console.log('�? └─ 运费模板');
    console.log('└─ 财务管理');
    console.log('   ├─ 账单管理');
    console.log('   └─ 提现管理');
  }
}

main();
