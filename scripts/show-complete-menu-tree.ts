import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MenuService } from '../modules/client/common/auth/services/menu.service';

/**
 * 显示完整菜单树结�?
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const menuService = app.get(MenuService);

  console.log('=== 完整的菜单树结构 ===\n');

  try {
    // 获取所有菜�?
    const allMenus = await menuService.getMenus();
    
    // 构建树形结构
    const menuTree = buildMenuTree(allMenus.items);
    
    // 打印树形结构
    printMenuTree(menuTree);
    
    console.log('\n=== 菜单统计 ===');
    console.log(`总菜单数�? ${allMenus.items.length}`);
    
    // 按层级统�?
    const levelStats = allMenus.items.reduce((acc, menu) => {
      const level = menu.level || 0;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    console.log('按层级统�?');
    Object.keys(levelStats).sort().forEach(level => {
      console.log(`  层级 ${level}: ${levelStats[level]} 个菜单`);
    });
    
    // 按模块统�?
    const moduleStats = {};
    allMenus.items.forEach(menu => {
      if (menu.level === 0) {
        moduleStats[menu.title] = 1;
      }
    });
    
    console.log(`\n总模块数: ${Object.keys(moduleStats).length}`);
    console.log('模块列表:');
    Object.keys(moduleStats).sort().forEach(module => {
      console.log(`  - ${module}`);
    });
    
  } catch (error) {
    console.error('获取菜单失败:', error);
  }

  await app.close();
}

/**
 * 构建菜单�?
 */
function buildMenuTree(menus: any[]) {
  const menuMap = new Map();
  const rootMenus = [];
  
  // 创建菜单映射
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });
  
  // 构建树形结构
  menus.forEach(menu => {
    const node = menuMap.get(menu.id);
    if (menu.parentId && menuMap.has(menu.parentId)) {
      menuMap.get(menu.parentId).children.push(node);
    } else {
      rootMenus.push(node);
    }
  });
  
  // 按排序值排�?
  rootMenus.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  rootMenus.forEach(menu => {
    menu.children.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  });
  
  return rootMenus;
}

/**
 * 打印菜单�?
 */
function printMenuTree(menuTree: any[], level = 0) {
  const indent = '  '.repeat(level);
  
  menuTree.forEach(menu => {
    const icon = menu.icon ? `[${menu.icon}]` : '';
    const permission = menu.permission ? ` (权限: ${menu.permission})` : '';
    
    console.log(`${indent}${menu.title} ${icon} - ${menu.path}${permission}`);
    
    if (menu.children && menu.children.length > 0) {
      printMenuTree(menu.children, level + 1);
    }
  });
}

bootstrap().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
